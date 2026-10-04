from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class ContentItemPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    description: str | None
    image_url: str | None
    locked: bool
    is_custom: bool
    extra: dict[str, Any]
    created_at: datetime


class ContentItemAdmin(ContentItemPublic):
    hidden: bool


class ContentItemCreate(BaseModel):
    title: str
    description: str | None = None
    image_url: str | None = None
    locked: bool = False
    extra: dict[str, Any] = {}


class ContentItemUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    image_url: str | None = None
    extra: dict[str, Any] | None = None


class LockUpdate(BaseModel):
    locked: bool


class FileAttach(BaseModel):
    """Attach a stored upload (key from POST /library/ebooks) to a content item.

    `key=None` detaches whatever file the item currently serves.
    """

    key: str | None = None
    filename: str | None = None
