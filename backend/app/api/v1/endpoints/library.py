"""The sealed e-book shelf: Keeper uploads + member-only downloads.

Flow
----
1. A Keeper uploads a PDF/EPUB from **Admin → E-Books** (`POST /library/ebooks`).
   The file is written outside the web root and the response carries an opaque
   ``key`` which the Keeper console stores on the book record
   (``extra.file_key`` / ``extra.file``).
2. Anyone may read the catalogue, but a **locked** (paid) book's file is only
   served by ``GET /library/files/{key}`` to a signed-in member whose
   ``paid`` flag is set — i.e. after the initiation payment has been sealed.
   The check runs on every request, so the URL in the browser is worthless
   without an entitled account (it is also never published to non-members).
3. Free volumes are served to everyone, and unattached uploads are Keeper-only.
"""

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_optional_user, require_admin
from app.core.config import settings
from app.core.security import create_stream_token, stream_token_matches
from app.crud import content as content_crud
from app.db.session import get_db
from app.models.content import Book, Video
from app.models.user import Role, User
from app.schemas.library import EbookUploadResult, StoredEbookAdmin
from app.services import storage
from app.services.storage import FILE_URL_PREFIX

router = APIRouter(prefix="/library", tags=["library"])


def _file_url(key: str) -> str:
    return f"{FILE_URL_PREFIX}/{key}"


def _safe_download_name(value: str, fallback: str = "volume") -> str:
    """Strips the characters that break Content-Disposition (quotes, CR/LF, path parts)."""
    cleaned = "".join(ch for ch in (value or "") if ch >= " " and ch not in '"/\\')
    return (cleaned.strip() or fallback)[:120]


def _display_name(book: Book | None, key: str) -> str:
    if book:
        stem = _safe_download_name(book.extra.get("file_name") or book.title)
        if "." in stem:
            stem = stem.rsplit(".", 1)[0]
        if stem:
            return stem
    return _safe_download_name(key.rsplit(".", 1)[0] or "volume")


@router.post("/ebooks", response_model=EbookUploadResult, status_code=status.HTTP_201_CREATED)
async def upload_ebook(
    file: UploadFile = File(...),
    _: User = Depends(require_admin),
):
    """Keeper: store a volume on the shelf and return the key to attach to a book."""
    stored = await storage.save_ebook_upload(file)
    return EbookUploadResult(
        key=stored.key,
        url=_file_url(stored.key),
        filename=stored.original_name,
        size=stored.size,
        content_type=stored.content_type,
        sha256=stored.sha256,
    )


@router.get("/ebooks", response_model=list[StoredEbookAdmin])
def list_ebooks(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Keeper: every volume on disk, with the book that serves it (if any)."""
    rows: list[StoredEbookAdmin] = []
    for meta in storage.list_stored_ebooks():
        book = content_crud.find_book_by_file_key(db, meta["key"])
        rows.append(
            StoredEbookAdmin(
                **meta,
                book_id=book.id if book else None,
                book_slug=book.slug if book else None,
                book_title=book.title if book else None,
                locked=book.locked if book else None,
            )
        )
    return rows


@router.delete("/ebooks/{key}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ebook(key: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Keeper: remove an unattached volume from disk (detach it from a book first)."""
    uses = content_crud.books_using_file_key(db, key)
    if uses:
        titles = ", ".join(book.title for book in uses)
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"This volume is attached to \"{titles}\". Replace the book's file first.",
        )
    storage.delete_stored_ebook(key)


def _authorize(book: Book | None, viewer: User | None) -> None:
    """Who may open this file?

    - free book  → anyone
    - paid book  → signed-in members with `paid = True` (or a Keeper)
    - unattached → Keeper only (a file staged before its book record exists)
    """
    if book is None:
        if viewer is None or viewer.role != Role.ADMIN:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Content item not found.")
        return
    if not book.locked:
        return
    if viewer is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sign in to open this volume.")
    if not (viewer.paid or viewer.role == Role.ADMIN):
        raise HTTPException(
            status.HTTP_402_PAYMENT_REQUIRED,
            "This volume is sealed. Complete your initiation to read it.",
        )


def _serve(key: str, book: Book | None, viewer: User | None, inline: bool, db: Session) -> FileResponse:
    path = storage.resolve_ebook_path(key)
    _authorize(book, viewer)

    if book is not None:
        downloads = int((book.extra or {}).get("downloads") or 0) + 1
        content_crud.merge_extra(db, book, {"downloads": downloads})

    headers = {
        "X-Content-Type-Options": "nosniff",
        # Sealed volumes must never sit in a shared/proxy cache.
        "Cache-Control": "private, no-store" if (book and book.locked) else "private, max-age=300",
    }
    # Volumes are read-only for members: only a Keeper may ever receive an attachment.
    as_attachment = (not inline) and viewer is not None and viewer.role == Role.ADMIN
    return FileResponse(
        path,
        media_type=storage.ALLOWED_EBOOK_TYPES.get(path.suffix.lower(), ("application/octet-stream", b""))[0],
        filename=f"{_display_name(book, key)}{path.suffix.lower()}",
        content_disposition_type="attachment" if as_attachment else "inline",
        headers=headers,
    )


@router.get("/books/{book_id}/file")
def serve_book_file(
    book_id: int,
    inline: bool = False,
    db: Session = Depends(get_db),
    viewer: User | None = Depends(get_optional_user),
):
    """Serve the volume a book record points at.

    The Library page uses this route (book id is public, the storage key is not),
    so a member who pays for the initiation can open the volume immediately —
    the entitlement is re-checked here on every request either way.
    """
    book = content_crud.get_by_id(db, Book, book_id)
    if not book or book.hidden:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Content item not found.")
    key = (book.extra or {}).get("file_key")
    if not key:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "This volume has no file on the shelf yet.")
    return _serve(key, book, viewer, inline, db)


@router.get("/files/{key}")
def serve_ebook(
    key: str,
    inline: bool = False,
    db: Session = Depends(get_db),
    viewer: User | None = Depends(get_optional_user),
):
    """Serve a stored volume by its storage key (Keeper shelf previews)."""
    return _serve(key, content_crud.find_book_by_file_key(db, key), viewer, inline, db)


@router.get("/limits")
def upload_limits():
    """Public: what the Keeper console needs for client-side file checks."""
    return {
        "max_size_mb": settings.MAX_EBOOK_SIZE_MB,
        "max_size_bytes": settings.max_ebook_bytes,
        "accepted": sorted(storage.ALLOWED_EBOOK_TYPES),
        "label": storage.ALLOWED_EBOOK_LABEL,
    }


# ---------------------------------------------------------------------------
# Uploaded videos
# ---------------------------------------------------------------------------


@router.post("/videos", status_code=status.HTTP_201_CREATED)
async def upload_video(file: UploadFile = File(...), _: User = Depends(require_admin)):
    """Keeper: store a video file and return the key to put on a video record."""
    stored = await storage.save_video_upload(file)
    return {
        "key": stored.key,
        "filename": stored.original_name,
        "size": stored.size,
        "content_type": stored.content_type,
    }


@router.get("/video-limits")
def video_limits():
    return {
        "max_size_mb": settings.MAX_VIDEO_SIZE_MB,
        "max_size_bytes": settings.max_video_bytes,
        "accepted": sorted(storage.ALLOWED_VIDEO_TYPES),
        "label": storage.ALLOWED_VIDEO_LABEL,
    }


def _get_video(db: Session, video_id: int) -> Video:
    video = content_crud.get_by_id(db, Video, video_id)
    if not video or video.hidden:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Content item not found.")
    return video


def _authorize_video(video: Video, viewer: User | None) -> None:
    if not video.locked:
        return
    if viewer is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sign in to watch this video.")
    if not (viewer.paid or viewer.role == Role.ADMIN):
        raise HTTPException(status.HTTP_402_PAYMENT_REQUIRED, "This video is sealed. Complete your initiation to watch it.")


@router.get("/videos/{video_id}/stream-url")
def video_stream_url(
    video_id: int,
    db: Session = Depends(get_db),
    viewer: User | None = Depends(get_optional_user),
):
    """Entitlement check, then a tokened URL for the <video> tag (free videos need no account)."""
    video = _get_video(db, video_id)
    _authorize_video(video, viewer)
    if not (video.extra or {}).get("video_key"):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "This video has no uploaded file.")
    return {"url": f"/api/v1/library/videos/{video.id}/stream?t={create_stream_token(video.id)}"}


@router.get("/videos/{video_id}/stream")
def stream_video(
    video_id: int,
    t: str = Query(...),
    db: Session = Depends(get_db),
):
    """Serves the uploaded file with HTTP Range support (seeking), inline only."""
    if not stream_token_matches(t, video_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This video link has expired. Reload the page.")
    video = _get_video(db, video_id)
    key = (video.extra or {}).get("video_key")
    if not key:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "This video has no uploaded file.")
    path = storage.resolve_video_path(key)
    return FileResponse(
        path,
        media_type=storage.ALLOWED_VIDEO_TYPES[path.suffix.lower()],
        content_disposition_type="inline",
        headers={"X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store"},
    )
