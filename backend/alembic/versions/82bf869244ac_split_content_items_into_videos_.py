"""split content_items into videos, rituals, images tables

Revision ID: 82bf869244ac
Revises: 016da48286e6
Create Date: 2026-09-15 19:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '82bf869244ac'
down_revision: Union[str, None] = '016da48286e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_TABLES = ("videos", "rituals", "images")
_KIND_FOR_TABLE = {"videos": "VIDEO", "rituals": "RITUAL", "images": "IMAGE"}

_COLUMNS = [
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('slug', sa.String(length=255), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('image_url', sa.String(length=500), nullable=True),
    sa.Column('locked', sa.Boolean(), nullable=False),
    sa.Column('hidden', sa.Boolean(), nullable=False),
    sa.Column('is_custom', sa.Boolean(), nullable=False),
    sa.Column('extra', sa.JSON(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
]


def upgrade() -> None:
    for table in _TABLES:
        op.create_table(
            table,
            *[c.copy() for c in _COLUMNS],
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('slug'),
        )
        op.create_index(op.f(f'ix_{table}_slug'), table, ['slug'], unique=False)

    connection = op.get_bind()
    for table, kind in _KIND_FOR_TABLE.items():
        connection.execute(sa.text(
            f"""
            INSERT INTO {table}
                (id, slug, title, description, image_url, locked, hidden, is_custom, extra, created_at, updated_at)
            SELECT id, slug, title, description, image_url, locked, hidden, is_custom, extra, created_at, updated_at
            FROM content_items
            WHERE kind = :kind
            """
        ), {"kind": kind})

    op.drop_table('content_items')


def downgrade() -> None:
    op.create_table(
        'content_items',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('kind', sa.Enum('VIDEO', 'RITUAL', 'IMAGE', name='contentkind'), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('locked', sa.Boolean(), nullable=False),
        sa.Column('hidden', sa.Boolean(), nullable=False),
        sa.Column('is_custom', sa.Boolean(), nullable=False),
        sa.Column('extra', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('kind', 'slug', name='uq_content_items_kind_slug'),
    )
    op.create_index(op.f('ix_content_items_slug'), 'content_items', ['slug'], unique=False)
    op.create_index(op.f('ix_content_items_kind'), 'content_items', ['kind'], unique=False)

    connection = op.get_bind()
    for table, kind in _KIND_FOR_TABLE.items():
        connection.execute(sa.text(
            f"""
            INSERT INTO content_items
                (id, kind, slug, title, description, image_url, locked, hidden, is_custom, extra, created_at, updated_at)
            SELECT id, :kind, slug, title, description, image_url, locked, hidden, is_custom, extra, created_at, updated_at
            FROM {table}
            """
        ), {"kind": kind})

    for table in _TABLES:
        op.drop_table(table)
