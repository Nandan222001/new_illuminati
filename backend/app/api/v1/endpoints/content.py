from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.crud import content as content_crud
from app.db.session import get_db
from app.models.content import CONTENT_MODELS, ContentKind
from app.models.user import User
from app.schemas.content import (
    ContentItemAdmin,
    ContentItemCreate,
    ContentItemPublic,
    ContentItemUpdate,
    LockUpdate,
)

router = APIRouter(prefix="/content", tags=["content"])


def _model_for(kind: ContentKind):
    return CONTENT_MODELS[kind]


def _get_or_404(db: Session, kind: ContentKind, item_id: int):
    item = content_crud.get_by_id(db, _model_for(kind), item_id)
    if not item:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Content item not found.")
    return item


@router.get("/{kind}", response_model=list[ContentItemPublic])
def list_public(kind: ContentKind, db: Session = Depends(get_db)):
    return content_crud.list_items(db, _model_for(kind), include_hidden=False)


@router.get("/{kind}/{slug}", response_model=ContentItemPublic)
def get_public(kind: ContentKind, slug: str, db: Session = Depends(get_db)):
    item = content_crud.get_by_slug(db, _model_for(kind), slug)
    if not item or item.hidden:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Content item not found.")
    return item


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


@router.delete("/{kind}/{item_id}", response_model=ContentItemAdmin | None)
def delete(
    kind: ContentKind,
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Custom items are fully removed; built-in (seed) items are hidden and can be restored."""
    item = _get_or_404(db, kind, item_id)
    return content_crud.delete_or_hide(db, item)
