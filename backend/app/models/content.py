import enum

from sqlalchemy import Boolean, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base, TimestampMixin


class ContentKind(str, enum.Enum):
    """Used only to dispatch the shared /content/{kind} API routes to the right table below."""

    VIDEO = "video"
    RITUAL = "ritual"
    IMAGE = "image"
    BOOK = "book"
    ARCHIVE = "archive"


class ContentFields:
    """
    Columns shared by videos, rituals and gallery images. Each content type
    gets its own table (see below) so the schema matches the site's actual
    entities instead of one polymorphic table; `extra` still holds
    kind-specific fields (e.g. tag/dur/views for videos, step/tags for
    rituals) so the admin CRUD surface stays generic.
    """

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    locked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    hidden: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_custom: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    extra: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)


class Video(Base, TimestampMixin, ContentFields):
    __tablename__ = "videos"


class Ritual(Base, TimestampMixin, ContentFields):
    __tablename__ = "rituals"


class Image(Base, TimestampMixin, ContentFields):
    __tablename__ = "images"


class Book(Base, TimestampMixin, ContentFields):
    """E-book shelved in the Library (extra holds pages/file/format)."""
    __tablename__ = "books"


class Archive(Base, TimestampMixin, ContentFields):
    """A Ritual Archive record/chamber (extra holds era/cap/body)."""
    __tablename__ = "archive_records"


# kind -> table lookup used by the shared /content/{kind} routes and CRUD helpers.
CONTENT_MODELS: dict[ContentKind, type] = {
    ContentKind.VIDEO: Video,
    ContentKind.RITUAL: Ritual,
    ContentKind.IMAGE: Image,
    ContentKind.BOOK: Book,
    ContentKind.ARCHIVE: Archive,
}
