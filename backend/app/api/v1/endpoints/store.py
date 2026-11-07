"""The one-book sale page (`/book` on the site).

A single card, a single volume, a single price — all of it set by the Keeper
from **Admin → Book Sale**. The page is public: no account, no membership and
no header/footer around it.

Flow
----
1. ``GET  /store/book``   — the card: cover, title, blurb, price (+ Razorpay key).
2. ``POST /store/order``  — raises a Razorpay order for that exact price.
3. ``POST /store/verify`` — checks Checkout's signature, records the sale and
   returns a short-lived signed download link.
4. ``GET  /store/download`` — serves the bought volume (token re-checked, and
   the payment must still be captured).

Sales are ordinary ``Transaction`` rows tagged ``store-order:`` /
``store-sale:``, so the Revenue dashboard counts them but they never unlock a
membership (see ``app/crud/store.py``).
"""

import hashlib
import hmac
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.security import create_store_download_token, store_download_token_claims
from app.crud import content as content_crud
from app.crud import store as store_crud
from app.db.session import get_db
from app.models.content import Book
from app.models.transaction import Transaction, TransactionStatus
from app.models.user import User
from app.schemas.store import (
    StoreBookPublic,
    StoreListingAdmin,
    StoreListingBook,
    StoreListingUpdate,
    StoreOrderRequest,
    StoreOrderResponse,
    StoreVerifyRequest,
    StoreVerifyResponse,
)
from app.services import razorpay, storage

router = APIRouter(prefix="/store", tags=["store"])
log = logging.getLogger(__name__)

NOT_ON_SALE = "No book is on sale right now."


def _extra(book: Book) -> dict:
    return book.extra or {}


def _file_name(book: Book) -> str | None:
    raw = _extra(book).get("file_name") or _extra(book).get("file") or ""
    if not isinstance(raw, str) or not raw:
        return None
    name = raw.rsplit("/", 1)[-1].split("?")[0]
    return name or None


def _sale_ready_or_404(db: Session) -> tuple[Book, int]:
    """The volume on sale and its price, or a 404 when the page is switched off."""
    listing = store_crud.get_listing(db)
    book = store_crud.listing_book(db, listing)
    if not listing.active or book is None or book.hidden or not listing.price:
        raise HTTPException(status.HTTP_404_NOT_FOUND, NOT_ON_SALE)
    return book, listing.price


# ---------------------------------------------------------------------------
# Public: the sale page
# ---------------------------------------------------------------------------


@router.get("/book", response_model=StoreBookPublic)
def public_book(db: Session = Depends(get_db)):
    """Everything the one card on /book shows — nothing else is ever sent."""
    book, price = _sale_ready_or_404(db)
    listing = store_crud.get_listing(db)
    key_id = razorpay.razorpay_config(db).get("keyId", "")
    return StoreBookPublic(
        title=book.title,
        description=book.description,
        image_url=book.image_url,
        price=price,
        currency=listing.currency or "INR",
        cta_label=listing.cta_label,
        format=_extra(book).get("format"),
        pages=_extra(book).get("pages"),
        file_name=_file_name(book),
        key_id=key_id or None,
    )


@router.post("/order", response_model=StoreOrderResponse)
def create_order(payload: StoreOrderRequest = StoreOrderRequest(), db: Session = Depends(get_db)):
    """Raise a Razorpay order for the listed price; Checkout opens with it."""
    book, price = _sale_ready_or_404(db)
    cfg = razorpay.require_keys(db)
    order = razorpay.create_order(
        cfg["keyId"],
        cfg["keySecret"],
        {
            "amount": price * 100,  # rupees -> paise
            "currency": "INR",
            "receipt": f"ib-book-{book.id}"[:40],
            "notes": {
                "source": "store",
                "book_id": str(book.id),
                "title": book.title[:100],
                "email": (payload.email or "").strip()[:200],
                "name": (payload.name or "").strip()[:120],
            },
        },
    )
    db.add(
        Transaction(
            user_id=None,
            amount=price,
            note=f"{store_crud.ORDER_PREFIX}{order['id']}",
            status=TransactionStatus.PENDING,
        )
    )
    db.commit()
    return StoreOrderResponse(
        orderId=order["id"],
        amount=order["amount"],
        currency=order["currency"],
        keyId=cfg["keyId"],
        title=book.title,
    )


@router.post("/verify", response_model=StoreVerifyResponse)
def verify_payment(payload: StoreVerifyRequest, db: Session = Depends(get_db)):
    """Check Checkout's signature, record the sale, hand back the download link."""
    key_secret = razorpay.razorpay_config(db).get("keySecret", "")
    if not key_secret:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Payments are not configured yet.")

    signed = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}".encode()
    expected = hmac.new(key_secret.encode(), signed, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, payload.razorpay_signature):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Payment could not be verified.")

    row = store_crud.order_row(db, payload.razorpay_order_id)
    if row is None:
        row = store_crud.find_payment_row(db, payload.razorpay_payment_id)
    if row is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This payment does not belong to a book order.")
    if row.status != TransactionStatus.CAPTURED:
        store_crud.capture(db, row, payload.razorpay_payment_id)

    # The volume the buyer paid for, resolved from the transaction's amount and
    # the current listing (the listing is the only book this page ever sells).
    listing = store_crud.get_listing(db)
    book = store_crud.listing_book(db, listing)
    if book is None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Payment received, but that book is no longer on sale. Contact support.")

    token = create_store_download_token(payload.razorpay_payment_id, book.id)
    key = store_crud.book_file_key(book)
    external = _extra(book).get("file") if not key else ""
    download = f"/api/v1/store/download?t={token}" if (key or (isinstance(external, str) and external.startswith("http"))) else None
    return StoreVerifyResponse(
        paid=True,
        title=book.title,
        file_name=_file_name(book),
        download_url=download,
    )


@router.get("/download")
def download(t: str = Query(...), db: Session = Depends(get_db)):
    """Serve a bought volume. The signed token is the entitlement (no account)."""
    claims = store_download_token_claims(t)
    if claims is None:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This download link has expired. Re-open your receipt.")
    payment_id, book_id = claims

    row = store_crud.find_payment_row(db, payment_id)
    if row is None or row.status != TransactionStatus.CAPTURED:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This download link is no longer valid.")

    book = db.get(Book, book_id)
    if book is None or book.hidden:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "That book is no longer available.")

    key = store_crud.book_file_key(book)
    if not key:
        external = _extra(book).get("file")
        if isinstance(external, str) and external.startswith("http"):
            return RedirectResponse(external, status_code=status.HTTP_302_FOUND)
        raise HTTPException(status.HTTP_404_NOT_FOUND, "This volume has no file to download.")

    path = storage.resolve_ebook_path(key)
    downloads = int(_extra(book).get("downloads") or 0) + 1
    content_crud.merge_extra(db, book, {"downloads": downloads})
    return FileResponse(
        path,
        media_type=storage.ALLOWED_EBOOK_TYPES.get(path.suffix.lower(), ("application/octet-stream", b""))[0],
        filename=_file_name(book) or f"{book.title[:80]}{path.suffix.lower()}",
        content_disposition_type="attachment",
        headers={"X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store"},
    )


# ---------------------------------------------------------------------------
# Keeper console: Admin → Book Sale
# ---------------------------------------------------------------------------


def _listing_payload(db: Session) -> StoreListingAdmin:
    listing = store_crud.get_listing(db)
    book = store_crud.listing_book(db, listing)
    return StoreListingAdmin(
        book_id=listing.book_id,
        price=listing.price,
        currency=listing.currency or "INR",
        active=listing.active,
        cta_label=listing.cta_label,
        book=StoreListingBook(
            id=book.id,
            title=book.title,
            image_url=book.image_url,
            has_file=bool(store_crud.book_file_key(book)),
            file_name=_file_name(book),
        )
        if book
        else None,
        payments_configured=bool(razorpay.razorpay_config(db).get("keyId")),
    )


@router.get("/listing", response_model=StoreListingAdmin)
def get_listing(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Keeper: what /book currently sells."""
    return _listing_payload(db)


@router.put("/listing", response_model=StoreListingAdmin)
def put_listing(payload: StoreListingUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Keeper: choose the one book on sale and its price."""
    if payload.book_id is not None:
        book = db.get(Book, payload.book_id)
        if book is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "That e-book is not on the shelf.")
    store_crud.save_listing(
        db,
        book_id=payload.book_id,
        price=payload.price,
        active=payload.active,
        cta_label=payload.cta_label,
    )
    return _listing_payload(db)
