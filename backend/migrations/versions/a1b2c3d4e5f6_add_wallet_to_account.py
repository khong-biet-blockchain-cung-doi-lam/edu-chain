"""add wallet fields to account

Revision ID: a1b2c3d4e5f6
Revises: e9f9367754a6
Create Date: 2026-03-03 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'e9f9367754a6'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('account', sa.Column('wallet_address', sa.String(length=42), nullable=True))
    op.add_column('account', sa.Column('encrypted_private_key', sa.Text(), nullable=True))
    op.create_unique_constraint('uq_account_wallet_address', 'account', ['wallet_address'])


def downgrade():
    op.drop_constraint('uq_account_wallet_address', 'account', type_='unique')
    op.drop_column('account', 'encrypted_private_key')
    op.drop_column('account', 'wallet_address')
