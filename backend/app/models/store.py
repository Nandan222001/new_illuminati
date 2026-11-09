from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base, TimestampMixin


class StoreListing(Base, TimestampMixin):
    """The single-book sale page (/book on the site).

    A singleton row (id=1) pointing at one shelved e-book plus the price the
    standalone page charges for it. The Keeper edits it from
    **Admin → Book Sale**; nothing else about the page is configurable.
    """

    __tablename__ = "store_listing"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # Which shelved e-book is on sale. SET NULL keeps the row if the book is deleted.
    book_id: Mapped[int | None] = mapped_column(
        ForeignKey("books.id", ondelete="SET NULL"), nullable=True
    )
    # Whole rupees, converted to paise when the Razorpay order is created.
    price: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="INR", nullable=False)
    # Off = the /book page answers 404 ("no book is on sale right now").
    active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # Optional button label; the page falls back to "Buy now".
    cta_label: Mapped[str | None] = mapped_column(String(80), nullable=True)
