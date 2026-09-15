import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base, TimestampMixin


class Role(str, enum.Enum):
    ADMIN = "admin"
    MEMBER = "member"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.MEMBER, nullable=False)
    initiate_number: Mapped[int] = mapped_column(Integer, nullable=False)

    paid: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    seal_id: Mapped[str | None] = mapped_column(String(32), nullable=True)
