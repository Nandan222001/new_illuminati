from sqlalchemy import select
from sqlalchemy.orm import Session


def slugify(text: str) -> str:
    lowered = "".join(c if c.isalnum() else "-" for c in text.lower()).strip("-")
    while "--" in lowered:
        lowered = lowered.replace("--", "-")
    return lowered or "item"


def unique_slug(db: Session, model, base: str) -> str:
    slug = base
    n = 2
    while db.scalar(select(model).where(model.slug == slug)):
        slug = f"{base}-{n}"
        n += 1
    return slug


def list_items(db: Session, model, *, include_hidden: bool = False) -> list:
    stmt = select(model).order_by(model.created_at)
    if not include_hidden:
        stmt = stmt.where(model.hidden.is_(False))
    return list(db.scalars(stmt))


def get_by_slug(db: Session, model, slug: str):
    return db.scalar(select(model).where(model.slug == slug))


def get_by_id(db: Session, model, item_id: int):
    return db.get(model, item_id)


def create_item(db: Session, model, *, title: str, description, image_url, locked: bool, extra: dict):
    slug = unique_slug(db, model, slugify(title))
    item = model(
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


def update_item(db: Session, item, patch: dict):
    for field in ("title", "description", "image_url"):
        if patch.get(field) is not None:
            setattr(item, field, patch[field])
    if patch.get("extra") is not None:
        item.extra = {**item.extra, **patch["extra"]}
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def set_locked(db: Session, item, locked: bool):
    item.locked = locked
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def set_hidden(db: Session, item, hidden: bool):
    item.hidden = hidden
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def delete_item(db: Session, item) -> None:
    db.delete(item)
    db.commit()


def delete_or_hide(db: Session, item):
    """Custom items are fully deleted; seed items are hidden (reversible)."""
    if item.is_custom:
        delete_item(db, item)
        return None
    return set_hidden(db, item, True)
