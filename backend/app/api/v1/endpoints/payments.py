import base64
import hashlib
import hmac
import json
import logging
import urllib.error
import urllib.request

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.crud import admin as admin_crud
from app.crud import user as user_crud
from app.db.session import get_db
from app.models.transaction import Transaction, TransactionStatus
from app.models.user import User

router = APIRouter(tags=["payments"])
log = logging.getLogger(__name__)

PAID_EVENTS = {"payment.captured", "order.paid"}
ORDER_PREFIX = "razorpay-order:"
RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders"


def _razorpay_config(db: Session) -> dict:
    """Razorpay credentials live in the database (Admin -> Settings -> Razorpay)."""
    return admin_crud.get_settings(db).razorpay or {}


def _create_razorpay_order(key_id: str, key_secret: str, payload: dict) -> dict:
    token = base64.b64encode(f"{key_id}:{key_secret}".encode()).decode()
    req = urllib.request.Request(
        RAZORPAY_ORDERS_URL,
        data=json.dumps(payload).encode(),
        headers={"Authorization": f"Basic {token}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as res:  # noqa: S310 (fixed https URL)
            return json.loads(res.read())
    except urllib.error.HTTPError as exc:
        log.error("Razorpay order creation failed: %s %s", exc.code, exc.read()[:300])
    except Exception:  # noqa: BLE001
        log.exception("Razorpay order creation failed")
    raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Could not start the payment. Please try again.")


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
    cfg = _razorpay_config(db)
    key_id, key_secret = cfg.get("keyId", ""), cfg.get("keySecret", "")
    if not key_id or not key_secret:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Payments are not configured yet.")

    amount = user_crud.INITIATION_FEE_INR * 100  # paise
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
            amount=user_crud.INITIATION_FEE_INR,
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
    secret = _razorpay_config(db).get("webhookSecret") or settings.RAZORPAY_WEBHOOK_SECRET
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
