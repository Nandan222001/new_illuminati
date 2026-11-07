"""The one-book sale page (/book) — server side.

Only one volume is on sale at a time: a singleton ``store_listing`` row points
at a shelved e-book and carries the price. Purchases are recorded as ordinary
``Transaction`` rows (so the Revenue page counts them), tagged with the
``store-order:`` prefix so they never unlock a membership.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.content import Book
from app.models.store import StoreListing
from app.models.transaction import Transaction, TransactionStatus

#: `note` marker for a Razorpay order raised by the /book page.
ORDER_PREFIX = "store-order:"
#: `note` marker once that order is captured.
PAID_MARKER = "store-sale:"

DEFAULT_CURRENCY = "INR"


def get_listing(db: Session) -> StoreListing:
    row = db.get(StoreListing, 1)
    if not row:
        row = StoreListing(id=1, book_id=None, price=0, currency=DEFAULT_CURRENCY, active=False)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


def save_listing(db: Session, *, book_id: int | None, price: int, active: bool, cta_label: str | None) -> StoreListing:
    row = get_listing(db)
    row.book_id = book_id
    row.price = int(price)
    row.active = bool(active)
    row.cta_label = (cta_label or "").strip() or None
    if not row.currency:
        row.currency = DEFAULT_CURRENCY
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def listing_book(db: Session, row: StoreListing | None = None) -> Book | None:
    """The shelved volume the listing points at (None when nothing is chosen)."""
    row = row or get_listing(db)
    if not row.book_id:
        return None
    return db.get(Book, row.book_id)


def book_file_key(book: Book | None) -> str:
    """The storage key of a volume uploaded from the console ('' for a link)."""
    if book is None:
        return ""
    extra = book.extra or {}
    key = extra.get("file_key")
    if key:
        return str(key)
    file = extra.get("file")
    if isinstance(file, str) and "/library/files/" in file:
        return file.rsplit("/library/files/", 1)[-1].split("?")[0]
    return ""


def order_row(db: Session, razorpay_order_id: str) -> Transaction | None:
    return db.scalar(select(Transaction).where(Transaction.note == f"{ORDER_PREFIX}{razorpay_order_id}"))


def find_payment_row(db: Session, payment_id: str) -> Transaction | None:
    """The store transaction a captured payment belongs to.

    Only rows this module wrote are considered (``store-order:`` /
    ``store-sale:`` prefixes), so a membership payment can never be mistaken
    for a book purchase. The scan is over the few rows that mention the id.
    """
    if not payment_id:
        return None
    rows = db.scalars(
        select(Transaction).where(Transaction.note.like(f"%{payment_id}%")).order_by(Transaction.id.desc())
    )
    for row in rows:
        if row.note.startswith(ORDER_PREFIX) or row.note.startswith(PAID_MARKER):
            return row
    return None


def capture(db: Session, row: Transaction, payment_id: str, *, email: str | None = None, amount: int | None = None) -> Transaction:
    """Mark a store order captured. Idempotent — Razorpay retries deliveries."""
    order_id = row.note[len(ORDER_PREFIX):] if row.note.startswith(ORDER_PREFIX) else "?"
    note = f"{PAID_MARKER}{payment_id} (order {order_id})"
    if email:
        note = f"{note} | {email}"
    row.status = TransactionStatus.CAPTURED
    row.note = note[:255]
    if amount:
        row.amount = int(amount)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
