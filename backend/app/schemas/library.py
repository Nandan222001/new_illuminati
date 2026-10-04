from datetime import datetime

from pydantic import BaseModel


class EbookUploadResult(BaseModel):
    """Returned to the Keeper console after a volume is written to disk."""

    key: str
    url: str  # what the book record stores in extra.file
    filename: str
    size: int
    content_type: str
    sha256: str
    protected: bool = True


class StoredEbookAdmin(BaseModel):
    """One file on the upload shelf, plus which book (if any) serves it."""

    key: str
    size: int
    modified_at: datetime
    content_type: str
    book_id: int | None = None
    book_slug: str | None = None
    book_title: str | None = None
    locked: bool | None = None
