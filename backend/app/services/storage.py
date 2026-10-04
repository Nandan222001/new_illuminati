"""E-book file storage (admin uploads).

Volumes are written to ``settings.ebooks_dir`` (backend/uploads/ebooks by
default) — deliberately **outside** any folder the app serves statically — and
are only reachable through ``GET /api/v1/library/files/{key}``, which checks
the reader's entitlement on every request. Keys are random, so a leaked key
cannot be guessed and never exposes the shape of the shelf.
"""

from __future__ import annotations

import hashlib
import re
import secrets
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

CHUNK_SIZE = 1024 * 1024  # 1 MiB

# Public path a book record stores in extra.file. Reaching it still requires an
# entitled account — the path is only a handle, never a direct file link.
FILE_URL_PREFIX = "/api/v1/library/files"

# Stored keys are flat, opaque file names: "<title-slug>-<random>.pdf".
KEY_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{5,140}$")
_SAFE_STEM_RE = re.compile(r"[^A-Za-z0-9_-]+")

# extension -> (media type, magic bytes the file must start with)
ALLOWED_EBOOK_TYPES: dict[str, tuple[str, bytes]] = {
    ".pdf": ("application/pdf", b"%PDF"),
    ".epub": ("application/epub+zip", b"PK\x03\x04"),
}
ALLOWED_EBOOK_LABEL = "PDF or EPUB"


@dataclass(frozen=True)
class StoredEbook:
    key: str
    path: Path
    original_name: str
    size: int
    sha256: str
    content_type: str
    extension: str


def ensure_ebook_dirs() -> Path:
    settings.ebooks_dir.mkdir(parents=True, exist_ok=True)
    return settings.ebooks_dir


def _clean_stem(filename: str) -> str:
    stem = _SAFE_STEM_RE.sub("-", Path(filename or "volume").stem).strip("-_")
    return (stem or "volume")[:48].lower()


def _human_mb(num_bytes: int) -> str:
    return f"{num_bytes / (1024 * 1024):.0f} MB"


def resolve_ebook_path(key: str) -> Path:
    """Maps a stored key to a file inside the uploads folder, or raises 4xx."""
    if not key or not KEY_RE.match(key):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid volume reference.")

    directory = ensure_ebook_dirs()
    path = (directory / key).resolve()
    # Keys are flat names: anything that escapes the directory (or a subfolder) is refused.
    if path.parent != directory.resolve():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid volume reference.")
    if path.suffix.lower() not in ALLOWED_EBOOK_TYPES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid volume reference.")
    if not path.is_file():
        raise HTTPException(status.HTTP_404_NOT_FOUND, "The volume file is no longer on the shelf.")
    return path


async def save_ebook_upload(upload: UploadFile) -> StoredEbook:
    """Streams an uploaded volume to disk in 1 MiB chunks, enforcing type and size."""
    original_name = Path(upload.filename or "volume.pdf").name
    extension = Path(original_name).suffix.lower()
    if extension not in ALLOWED_EBOOK_TYPES:
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            f"Only {ALLOWED_EBOOK_LABEL} volumes are accepted.",
        )
    content_type, magic = ALLOWED_EBOOK_TYPES[extension]

    directory = ensure_ebook_dirs()
    key = f"{_clean_stem(original_name)}-{secrets.token_hex(8)}{extension}"
    target = directory / key
    scratch = directory / f".{secrets.token_hex(8)}.part"

    digest = hashlib.sha256()
    size = 0
    try:
        with scratch.open("wb") as handle:
            first_chunk = True
            while True:
                chunk = await upload.read(CHUNK_SIZE)
                if not chunk:
                    break
                if first_chunk:
                    first_chunk = False
                    # Don't trust the extension alone: a renamed .jpg must not be stored as a volume.
                    if not chunk.startswith(magic):
                        raise HTTPException(
                            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                            f"That file is not a valid {ALLOWED_EBOOK_LABEL} file.",
                        )
                size += len(chunk)
                if size > settings.max_ebook_bytes:
                    raise HTTPException(
                        status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        f"The volume is larger than the {settings.MAX_EBOOK_SIZE_MB} MB limit.",
                    )
                digest.update(chunk)
                handle.write(chunk)
        if size == 0:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "The uploaded file is empty.")
        scratch.replace(target)  # atomic on the same filesystem
    except BaseException:
        scratch.unlink(missing_ok=True)
        raise

    return StoredEbook(
        key=key,
        path=target,
        original_name=original_name,
        size=size,
        sha256=digest.hexdigest(),
        content_type=content_type,
        extension=extension,
    )


def file_metadata(key: str) -> dict:
    """Size/last-modified for a stored volume (used by the admin file shelf)."""
    path = resolve_ebook_path(key)
    stat = path.stat()
    return {
        "key": key,
        "size": stat.st_size,
        "modified_at": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc),
        "content_type": ALLOWED_EBOOK_TYPES.get(path.suffix.lower(), ("application/octet-stream", b""))[0],
    }


def list_stored_ebooks() -> list[dict]:
    directory = ensure_ebook_dirs()
    rows: list[dict] = []
    for path in sorted(directory.glob("*"), key=lambda p: p.stat().st_mtime, reverse=True):
        if not path.is_file() or path.name.startswith("."):
            continue
        if path.suffix.lower() not in ALLOWED_EBOOK_TYPES:
            continue
        try:
            rows.append(file_metadata(path.name))
        except HTTPException:
            continue
    return rows


def delete_stored_ebook(key: str) -> None:
    path = resolve_ebook_path(key)
    path.unlink(missing_ok=True)


def size_label(num_bytes: int | None) -> str:
    """'2.4 MB' — also used by tests/humans reading logs."""
    if not num_bytes:
        return "—"
    if num_bytes >= 1024 * 1024:
        return f"{num_bytes / (1024 * 1024):.1f} MB"
    return f"{max(1, round(num_bytes / 1024))} KB"


def too_large_message() -> str:
    return f"The volume is larger than the {settings.MAX_EBOOK_SIZE_MB} MB limit ({_human_mb(settings.max_ebook_bytes)})."
