from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.admin_settings import AdminSettings
from app.models.transaction import Transaction
from app.models.user import User


def get_settings(db: Session) -> AdminSettings:
    settings_row = db.get(AdminSettings, 1)
    if not settings_row:
        settings_row = AdminSettings(id=1, razorpay={}, smtp={}, twilio={})
        db.add(settings_row)
        db.commit()
        db.refresh(settings_row)
    return settings_row


def save_settings(db: Session, *, razorpay: dict, smtp: dict, twilio: dict) -> AdminSettings:
    settings_row = get_settings(db)
    settings_row.razorpay = razorpay
    settings_row.smtp = smtp
    settings_row.twilio = twilio
    db.add(settings_row)
    db.commit()
    db.refresh(settings_row)
    return settings_row


def list_transactions(db: Session, limit: int = 50) -> list[dict]:
    rows = db.execute(
        select(Transaction, User.name)
        .join(User, User.id == Transaction.user_id, isouter=True)
        .order_by(Transaction.created_at.desc())
        .limit(limit)
    ).all()
    return [
        {
            "id": tx.id,
            "user_id": tx.user_id,
            "name": name or "Deleted initiate",
            "amount": tx.amount,
            "note": tx.note,
            "status": tx.status,
            "date": tx.created_at,
        }
        for tx, name in rows
    ]


def revenue_series(db: Session, months: int = 6) -> list[dict]:
    now = datetime.now(timezone.utc)
    buckets: list[tuple[int, int, str]] = []
    year, month = now.year, now.month
    for _ in range(months):
        buckets.append((year, month, datetime(year, month, 1).strftime("%b")))
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    buckets.reverse()

    rows = list(db.scalars(select(Transaction)))
    out = []
    for year, month, label in buckets:
        matching = [tx for tx in rows if tx.created_at.year == year and tx.created_at.month == month]
        out.append(
            {
                "label": label,
                "subscriptions": len(matching),
                "revenue": sum(tx.amount for tx in matching),
            }
        )
    return out
