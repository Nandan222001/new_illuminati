"""v1.1.8: the one-book sale page (/book)

Revision ID: 7d3c19a5b0f4
Revises: 5c7a91b4d2e1
Create Date: 2026-11-07 10:00:00.000000

Adds `store_listing`, the singleton row behind the standalone /book page: which
shelved e-book is on sale, the price charged for it and whether the page is
switched on. Purchases reuse the existing `transactions` table.
"""
from datetime import datetime, timezone
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7d3c19a5b0f4'
down_revision: Union[str, None] = '5c7a91b4d2e1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'store_listing',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('book_id', sa.Integer(), nullable=True),
        sa.Column('price', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('currency', sa.String(length=8), nullable=False, server_default='INR'),
        sa.Column('active', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('cta_label', sa.String(length=80), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['book_id'], ['books.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    # Singleton row (id=1): the page reads it, the Keeper console writes it.
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    op.execute(
        "INSERT INTO store_listing (id, book_id, price, currency, active, created_at, updated_at) "
        f"VALUES (1, NULL, 0, 'INR', 0, '{now}', '{now}')"
    )


def downgrade() -> None:
    op.drop_table('store_listing')
