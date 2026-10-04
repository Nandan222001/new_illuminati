"""v1.1.6: e-books, archive records, community threads, social links

Revision ID: 5c7a91b4d2e1
Revises: 82bf869244ac
Create Date: 2026-10-04 10:00:00.000000

Adds everything the 1.1.6 change-list needs on the server:
  • books + archive_records content tables (same shape as videos/rituals/images)
  • community_threads + community_messages for the private initiate ⇄ Keeper board
  • admin_settings.social for the Keeper-managed social profile links
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5c7a91b4d2e1'
down_revision: Union[str, None] = '82bf869244ac'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


CONTENT_COLUMNS = [
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('slug', sa.String(length=255), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('image_url', sa.String(length=500), nullable=True),
    sa.Column('locked', sa.Boolean(), nullable=False, server_default=sa.false()),
    sa.Column('hidden', sa.Boolean(), nullable=False, server_default=sa.false()),
    sa.Column('is_custom', sa.Boolean(), nullable=False, server_default=sa.false()),
    sa.Column('extra', sa.JSON(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
]


def upgrade() -> None:
    # --- e-books ---
    op.create_table('books', *CONTENT_COLUMNS)
    op.create_index(op.f('ix_books_slug'), 'books', ['slug'], unique=True)

    # --- archive records (the chambers) ---
    op.create_table('archive_records', *CONTENT_COLUMNS)
    op.create_index(op.f('ix_archive_records_slug'), 'archive_records', ['slug'], unique=True)

    # --- private community threads ---
    op.create_table(
        'community_threads',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('subject', sa.String(length=160), nullable=True),
        sa.Column('status', sa.Enum('open', 'answered', name='threadstatus'), nullable=False,
                  server_default='open'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_community_threads_user_id'), 'community_threads', ['user_id'])

    op.create_table(
        'community_messages',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('thread_id', sa.Integer(), nullable=False),
        sa.Column('author_id', sa.Integer(), nullable=True),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['thread_id'], ['community_threads.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_community_messages_thread_id'), 'community_messages', ['thread_id'])

    # --- Keeper-managed social links ---
    op.add_column('admin_settings', sa.Column('social', sa.JSON(), nullable=True))
    op.execute("UPDATE admin_settings SET social = '{}' WHERE social IS NULL")
    op.alter_column('admin_settings', 'social', existing_type=sa.JSON(), nullable=False)


def downgrade() -> None:
    op.drop_column('admin_settings', 'social')
    op.drop_index(op.f('ix_community_messages_thread_id'), table_name='community_messages')
    op.drop_table('community_messages')
    op.drop_index(op.f('ix_community_threads_user_id'), table_name='community_threads')
    op.drop_table('community_threads')
    sa.Enum(name='threadstatus').drop(op.get_bind(), checkfirst=True)
    op.drop_index(op.f('ix_archive_records_slug'), table_name='archive_records')
    op.drop_table('archive_records')
    op.drop_index(op.f('ix_books_slug'), table_name='books')
    op.drop_table('books')
