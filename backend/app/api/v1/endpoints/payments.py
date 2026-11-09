import hashlib
import hmac
import json
import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.crud import admin as admin_crud
from app.crud import store as store_crud
from app.crud import user as user_crud
from app.db.session import get_db
from app.models.transaction import Transaction, TransactionStatus
from app.models.user import User
from app.services import razorpay

router = APIRouter(tags=["payments"])
log = logging.getLogger(__name__)

PAID_EVENTS = {"payment.captured", "order.paid"}
ORDER_PREFIX = "razorpay-order:"


# Razorpay credentials + order creation live in app/services/razorpay.py, shared
# with the one-book sale page (/store).
_razorpay_config = razorpay.razorpay_config
_create_razorpay_order = razorpay.create_order


def _order_row(db: Session, order_id: str) -> Transaction | None:
    return db.scalar(select(Transaction).where(Transaction.note == f"{ORDER_PREFIX}{order_id}"))


def _seal_from_order(db: Session, row: Transaction, payment_id: str) -> User | None:
    """Mark an order's transaction captured and unlock its member. Idempotent."""
    user = db.get(User, row.user_id) if row.user_id else None
    if row.status != TransactionStatus.CAPTURED:
        row.status = TransactionStatus.CAPTURED
        row.note = f"Razorpay {payment_id} (order {row.note[len(ORDER_PREFIX):]})"
        db.add(row)
        db.commit()
    if user and not user.paid:
        user_crud.seal_initiation(db, user, amount=row.amount, note=row.note, record=False)
    return user


@router.post("/payments/order")
def create_order(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a Razorpay order for the initiation fee; the browser opens Checkout with it."""
    if user.paid:
        raise HTTPException(status.HTTP_409_CONFLICT, "Your initiation is already sealed.")
    cfg = razorpay.require_keys(db)
    key_id, key_secret = cfg["keyId"], cfg["keySecret"]

    fee = admin_crud.joining_fee(db)  # rupees, set by the Keeper
    amount = fee * 100  # paise
    order = _create_razorpay_order(
        key_id,
        key_secret,
        {
            "amount": amount,
            "currency": "INR",
            "receipt": f"ib-{user.id}-{user.initiate_number}"[:40],
            "notes": {"user_id": str(user.id), "email": user.email},
        },
    )
    db.add(
        Transaction(
            user_id=user.id,
            amount=fee,
            note=f"{ORDER_PREFIX}{order['id']}",
            status=TransactionStatus.PENDING,
        )
    )
    db.commit()
    return {"orderId": order["id"], "amount": order["amount"], "currency": order["currency"], "keyId": key_id}


class VerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.post("/payments/verify")
def verify_payment(payload: VerifyRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Verify Checkout's signature and unlock the member (the webhook is the backup path)."""
    key_secret = _razorpay_config(db).get("keySecret", "")
    if not key_secret:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Payments are not configured yet.")
    signed = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}".encode()
    expected = hmac.new(key_secret.encode(), signed, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, payload.razorpay_signature):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Payment could not be verified.")
    row = _order_row(db, payload.razorpay_order_id)
    if row is None or row.user_id != user.id:
        # Either the order is already captured under a new note, or it isn't this member's.
        refreshed = db.get(User, user.id)
        if refreshed and refreshed.paid:
            return {"paid": True}
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This payment does not belong to your account.")
    _seal_from_order(db, row, payload.razorpay_payment_id)
    return {"paid": True}


@router.post("/paymentwebhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """Razorpay webhook (backup path): unlocks the member when a payment is captured."""
    secret = _razorpay_config(db).get("webhookSecret")
    if not secret:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Payment webhook is not configured.")

    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")
    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid signature.")

    try:
        event = json.loads(body)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid payload.") from exc
    if event.get("event") not in PAID_EVENTS:
        return {"status": "ignored"}

    payment = (((event.get("payload") or {}).get("payment") or {}).get("entity")) or {}
    payment_id = str(payment.get("id") or "")
    order_id = str(payment.get("order_id") or "")
    email = str(payment.get("email") or "").strip().lower()
    if not payment_id:
        return {"status": "ignored"}
    amount = int(payment.get("amount") or 0) // 100  # paise -> rupees

    # Our own checkout: the order row ties the payment to the member.
    if order_id:
        row = _order_row(db, order_id)
        if row is not None:
            _seal_from_order(db, row, payment_id)
            return {"status": "sealed"}

    # A purchase from the one-book sale page (/book) records the sale but never
    # unlocks a membership — the buyer may not even have an account.
    store_row = store_crud.order_row(db, order_id) if order_id else None
    if store_row is None:
        store_row = store_crud.find_payment_row(db, payment_id)
    if store_row is not None:
        if store_row.status != TransactionStatus.CAPTURED:
            store_crud.capture(db, store_row, payment_id, email=email, amount=amount or None)
        return {"status": "store-captured"}

    # Idempotent: Razorpay retries deliveries.
    if db.scalar(select(Transaction.id).where(Transaction.note.like(f"%{payment_id}%"))):
        return {"status": "duplicate"}

    # Payment made outside our checkout (e.g. a Razorpay payment page): match by email.
    if not email:
        return {"status": "ignored"}
    user = db.scalar(select(User).where(User.email == email))
    if user:
        user_crud.seal_initiation(db, user, amount=amount, note=f"Razorpay {payment_id}")
        return {"status": "sealed"}
    db.add(
        Transaction(
            user_id=None,
            amount=amount,
            note=f"{user_crud.PENDING_PREFIX}{payment_id}|{email}",
            status=TransactionStatus.CAPTURED,
        )
    )
    db.commit()
    return {"status": "pending"}
