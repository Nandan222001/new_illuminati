from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_optional_user, require_admin
from app.crud import content as content_crud
from app.db.session import get_db
from app.models.content import CONTENT_MODELS, ContentKind
from app.models.user import Role, User
from app.schemas.content import (
    ContentItemAdmin,
    ContentItemCreate,
    ContentItemPublic,
    ContentItemUpdate,
    FileAttach,
    LockUpdate,
)
from app.services import storage
from app.services.storage import FILE_URL_PREFIX

router = APIRouter(prefix="/content", tags=["content"])

# extra.* keys that point at (or describe) a downloadable volume's file.
FILE_EXTRA_KEYS = ("file", "file_key", "file_name", "file_size", "file_uploaded_at")


def _model_for(kind: ContentKind):
    return CONTENT_MODELS[kind]


def _can_open(item, viewer: User | None) -> bool:
    """Free items are open to all; sealed items open once the oath is paid."""
    if not item.locked:
        return True
    return viewer is not None and (viewer.role == Role.ADMIN or viewer.paid)


def _view_for(item, viewer: User | None):
    """Public view of an item, with a sealed volume's file withheld from non-members.

    Without this an unpaid visitor could read the PDF's URL straight out of the
    public catalogue. `has_file` survives so the Library can still show "sealed"
    with a working call to action instead of "awaiting print".
    """
    if _can_open(item, viewer):
        return item
    raw = item.extra or {}
    extra = {k: v for k, v in raw.items() if k not in FILE_EXTRA_KEYS}
    if raw.get("file"):
        extra["has_file"] = True
        # Lets the Library know whether the hidden file is ours (fetchable with a
        # token, /library/books/{id}/file) or an external link.
        extra["file_storage"] = "local" if raw.get("file_key") else "external"
    return ContentItemPublic.model_validate(item).model_copy(update={"extra": extra})


def _get_or_404(db: Session, kind: ContentKind, item_id: int):
    item = content_crud.get_by_id(db, _model_for(kind), item_id)
    if not item:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Content item not found.")
    return item


@router.get("/{kind}", response_model=list[ContentItemPublic])
def list_public(
    kind: ContentKind,
    db: Session = Depends(get_db),
    viewer: User | None = Depends(get_optional_user),
):
    items = content_crud.list_items(db, _model_for(kind), include_hidden=False)
    return [_view_for(item, viewer) for item in items]


@router.get("/{kind}/{slug}", response_model=ContentItemPublic)
def get_public(
    kind: ContentKind,
    slug: str,
    db: Session = Depends(get_db),
    viewer: User | None = Depends(get_optional_user),
):
    item = content_crud.get_by_slug(db, _model_for(kind), slug)
    if not item or item.hidden:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Content item not found.")
    return _view_for(item, viewer)


@router.get("/{kind}/admin/all", response_model=list[ContentItemAdmin])
def list_admin(kind: ContentKind, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return content_crud.list_items(db, _model_for(kind), include_hidden=True)


@router.post("/{kind}", response_model=ContentItemPublic, status_code=status.HTTP_201_CREATED)
def create(
    kind: ContentKind,
    payload: ContentItemCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return content_crud.create_item(
        db,
        _model_for(kind),
        title=payload.title,
        description=payload.description,
        image_url=payload.image_url,
        locked=payload.locked,
        extra=payload.extra,
    )


@router.patch("/{kind}/{item_id}", response_model=ContentItemPublic)
def update(
    kind: ContentKind,
    item_id: int,
    payload: ContentItemUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    item = _get_or_404(db, kind, item_id)
    return content_crud.update_item(db, item, payload.model_dump(exclude_unset=True))


@router.patch("/{kind}/{item_id}/lock", response_model=ContentItemPublic)
def set_lock(
    kind: ContentKind,
    item_id: int,
    payload: LockUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    item = _get_or_404(db, kind, item_id)
    return content_crud.set_locked(db, item, payload.locked)


@router.post("/{kind}/{item_id}/restore", response_model=ContentItemPublic)
def restore(
    kind: ContentKind,
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    item = _get_or_404(db, kind, item_id)
    return content_crud.set_hidden(db, item, False)


@router.patch("/{kind}/{item_id}/file", response_model=ContentItemPublic)
def attach_file(
    kind: ContentKind,
    item_id: int,
    payload: FileAttach,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Admin: attach (or detach, with `key: null`) an uploaded volume to an item.

    Keeping this server-side means `extra.file_key` — the handle the download
    endpoint authorises on — can never be set to an arbitrary path by a client.
    """
    item = _get_or_404(db, kind, item_id)
    if payload.key:
        path = storage.resolve_ebook_path(payload.key)  # 4xx if unknown/unsafe
        return content_crud.merge_extra(
            db,
            item,
            {
                "file": f"{FILE_URL_PREFIX}/{payload.key}",
                "file_key": payload.key,
                "file_name": payload.filename or path.name,
                "file_size": path.stat().st_size,
                "file_uploaded_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            },
        )
    return content_crud.merge_extra(
        db,
        item,
        {name: None for name in ("file_key", "file_name", "file_size", "file_uploaded_at")},
    )


@router.delete("/{kind}/{item_id}", response_model=ContentItemAdmin | None)
def delete(
    kind: ContentKind,
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Custom items are fully removed; built-in (seed) items are hidden and can be restored."""
    item = _get_or_404(db, kind, item_id)
    file_key = (item.extra or {}).get("file_key")
    result = content_crud.delete_or_hide(db, item)
    if kind == ContentKind.BOOK and result is None and file_key:
        # The book is gone for good: don't leave its PDF orphaned on disk.
        try:
            if not content_crud.books_using_file_key(db, file_key):
                storage.delete_stored_ebook(file_key)
        except HTTPException:
            pass
    return result
