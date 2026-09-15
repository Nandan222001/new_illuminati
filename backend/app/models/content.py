import enum

from sqlalchemy import Boolean, Enum, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base, TimestampMixin


class ContentKind(str, enum.Enum):
    VIDEO = "video"
    RITUAL = "ritual"
    IMAGE = "image"


class ContentItem(Base, TimestampMixin):
    """
    Unified table for videos, rituals and gallery images.

    `extra` holds kind-specific fields (e.g. tag/dur/views for videos, step/tags
    for rituals, cap/portrait for images) so all three content types share one
    table and one admin CRUD surface, matching how the frontend already treats
    them as one "content catalog" with per-item lock/hidden flags.
    """

    __tablename__ = "content_items"
    __table_args__ = (UniqueConstraint("kind", "slug", name="uq_content_items_kind_slug"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    kind: Mapped[ContentKind] = mapped_column(Enum(ContentKind), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    locked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    hidden: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_custom: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    extra: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
