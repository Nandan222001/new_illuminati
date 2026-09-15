from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.content import ContentItem, ContentKind


def slugify(text: str) -> str:
    lowered = "".join(c if c.isalnum() else "-" for c in text.lower()).strip("-")
    while "--" in lowered:
        lowered = lowered.replace("--", "-")
    return lowered or "item"


def unique_slug(db: Session, kind: ContentKind, base: str) -> str:
    slug = base
    n = 2
    while db.scalar(select(ContentItem).where(ContentItem.kind == kind, ContentItem.slug == slug)):
        slug = f"{base}-{n}"
        n += 1
    return slug


def list_items(db: Session, kind: ContentKind, *, include_hidden: bool = False) -> list[ContentItem]:
    stmt = select(ContentItem).where(ContentItem.kind == kind).order_by(ContentItem.created_at)
    if not include_hidden:
        stmt = stmt.where(ContentItem.hidden.is_(False))
    return list(db.scalars(stmt))


def get_by_slug(db: Session, kind: ContentKind, slug: str) -> ContentItem | None:
    return db.scalar(select(ContentItem).where(ContentItem.kind == kind, ContentItem.slug == slug))


def get_by_id(db: Session, item_id: int) -> ContentItem | None:
    return db.get(ContentItem, item_id)


def create_item(db: Session, kind: ContentKind, *, title: str, description, image_url, locked: bool, extra: dict) -> ContentItem:
    slug = unique_slug(db, kind, slugify(title))
    item = ContentItem(
        kind=kind,
        slug=slug,
        title=title,
        description=description,
        image_url=image_url,
        locked=locked,
        hidden=False,
        is_custom=True,
        extra=extra,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_item(db: Session, item: ContentItem, patch: dict) -> ContentItem:
    for field in ("title", "description", "image_url"):
        if patch.get(field) is not None:
            setattr(item, field, patch[field])
    if patch.get("extra") is not None:
        item.extra = {**item.extra, **patch["extra"]}
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def set_locked(db: Session, item: ContentItem, locked: bool) -> ContentItem:
    item.locked = locked
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def set_hidden(db: Session, item: ContentItem, hidden: bool) -> ContentItem:
    item.hidden = hidden
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def delete_item(db: Session, item: ContentItem) -> None:
    db.delete(item)
    db.commit()


def delete_or_hide(db: Session, item: ContentItem) -> ContentItem | None:
    """Custom items are fully deleted; seed items are hidden (reversible)."""
    if item.is_custom:
        delete_item(db, item)
        return None
    return set_hidden(db, item, True)
