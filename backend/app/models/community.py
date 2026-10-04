import enum

from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin
from app.models.user import User


class ThreadStatus(str, enum.Enum):
    OPEN = "open"
    ANSWERED = "answered"


class CommunityThread(Base, TimestampMixin):
    """
    A private conversation opened by one initiate with the Keepers.

    Visibility is enforced by the API, never by the client alone: a thread is
    readable by its author and by admins, and by nobody else. There is no
    public/shared board, so a third member can never read someone else's
    submission.
    """

    __tablename__ = "community_threads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    subject: Mapped[str | None] = mapped_column(String(160), nullable=True)
    status: Mapped[ThreadStatus] = mapped_column(
        Enum(ThreadStatus, values_callable=lambda enum_cls: [member.value for member in enum_cls]),
        default=ThreadStatus.OPEN,
        nullable=False,
    )

    user: Mapped[User] = relationship("User", lazy="joined")
    messages: Mapped[list["CommunityMessage"]] = relationship(
        "CommunityMessage",
        back_populates="thread",
        cascade="all, delete-orphan",
        order_by="CommunityMessage.created_at",
    )


class CommunityMessage(Base, TimestampMixin):
    """One message inside a thread — written by its author or by a Keeper."""

    __tablename__ = "community_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    thread_id: Mapped[int] = mapped_column(
        ForeignKey("community_threads.id", ondelete="CASCADE"), index=True, nullable=False
    )
    author_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)

    thread: Mapped[CommunityThread] = relationship("CommunityThread", back_populates="messages")
    author: Mapped[User | None] = relationship("User", lazy="joined")
