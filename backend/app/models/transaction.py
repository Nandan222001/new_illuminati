import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class TransactionStatus(str, enum.Enum):
    CAPTURED = "captured"
    REFUNDED = "refunded"
    PENDING = "pending"


class Transaction(Base):
    """
    Simulated payment record. Nothing here talks to a real payment gateway —
    rows are created when a user completes the fictional ₹999 initiation fee,
    and read back to build the admin revenue dashboard.
    """

    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    note: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[TransactionStatus] = mapped_column(
        Enum(TransactionStatus), default=TransactionStatus.CAPTURED, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
