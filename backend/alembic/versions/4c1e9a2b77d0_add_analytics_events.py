"""add analytics_events

Revision ID: 4c1e9a2b77d0
Revises: 82bf869244ac
Create Date: 2026-09-21
"""
from alembic import op
import sqlalchemy as sa

revision = '4c1e9a2b77d0'
down_revision = '82bf869244ac'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'analytics_events',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('kind', sa.Enum('visit', 'payment_success', 'payment_failed', name='eventkind'), nullable=False),
        sa.Column('path', sa.String(length=255), nullable=True),
        sa.Column('device_id', sa.String(length=64), nullable=True),
        sa.Column('reason', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_analytics_events_kind', 'analytics_events', ['kind'])
    op.create_index('ix_analytics_events_device_id', 'analytics_events', ['device_id'])
    op.create_index('ix_analytics_events_created_at', 'analytics_events', ['created_at'])


def downgrade() -> None:
    op.drop_index('ix_analytics_events_created_at', table_name='analytics_events')
    op.drop_index('ix_analytics_events_device_id', table_name='analytics_events')
    op.drop_index('ix_analytics_events_kind', table_name='analytics_events')
    op.drop_table('analytics_events')
    op.execute("DROP TYPE eventkind")
