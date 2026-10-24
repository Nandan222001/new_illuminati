import hashlib
import hmac
import json
import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.crud import admin as admin_crud
from app.crud import user as user_crud
from app.db.session import get_db
from app.models.transaction import Transaction, TransactionStatus
from app.models.user import User

router = APIRouter(tags=["payments"])
log = logging.getLogger(__name__)

PAID_EVENTS = {"payment.captured", "payment_link.paid", "order.paid"}


def _payment_entity(event: dict) -> dict:
    return (((event.get("payload") or {}).get("payment") or {}).get("entity")) or {}


@router.post("/paymentwebhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """Razorpay webhook: verifies the signature, then unlocks the member whose email paid."""
    # Credentials are stored in the database (Admin -> Settings -> Razorpay); the env var is only a fallback.
    secret = (admin_crud.get_settings(db).razorpay or {}).get("webhookSecret") or settings.RAZORPAY_WEBHOOK_SECRET
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

    payment = _payment_entity(event)
    payment_id = str(payment.get("id") or "")
    email = str(payment.get("email") or "").strip().lower()
    if not payment_id or not email:
        log.warning("Razorpay webhook without payment id/email: %s", event.get("event"))
        return {"status": "ignored"}
    amount = int(payment.get("amount") or 0) // 100  # paise -> rupees

    # Idempotent: Razorpay retries deliveries.
    seen = db.scalar(select(Transaction.id).where(Transaction.note.like(f"%{payment_id}%")))
    if seen:
        return {"status": "duplicate"}

    user = db.scalar(select(User).where(User.email == email))
    if user:
        user_crud.seal_initiation(db, user, amount=amount, note=f"Razorpay {payment_id}")
        return {"status": "sealed"}

    # Paid before registering (or with a different email): hold it and claim on registration.
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
