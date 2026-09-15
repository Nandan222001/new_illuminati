from sqlalchemy import JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base, TimestampMixin


class AdminSettings(Base, TimestampMixin):
    """Singleton row (id=1) holding integration settings shown on the Keeper console."""

    __tablename__ = "admin_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    razorpay: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    smtp: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    twilio: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
