"""add encrypted_clusters table

Revision ID: e9f9367754a6
Revises: 
Create Date: 2026-02-27 08:11:09.154485

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'e9f9367754a6'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Chỉ tạo bảng encrypted_clusters — không thay đổi bảng hiện có
    op.create_table(
        'encrypted_clusters',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('cluster_type', sa.String(length=50), nullable=False),
        sa.Column('subject_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('subject_code', sa.String(length=50), nullable=True),
        sa.Column('ciphertext', sa.Text(), nullable=False),
        sa.Column('iv', sa.String(length=50), nullable=False),
        sa.Column('encrypted_aes_key', sa.Text(), nullable=False),
        sa.Column('managed_by_role', sa.String(length=30), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='ENCRYPTED'),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('decrypted_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('decrypted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_encrypted_clusters_cluster_type', 'encrypted_clusters', ['cluster_type'], unique=False)
    op.create_index('ix_encrypted_clusters_subject_id', 'encrypted_clusters', ['subject_id'], unique=False)


def downgrade():
    op.drop_index('ix_encrypted_clusters_subject_id', table_name='encrypted_clusters')
    op.drop_index('ix_encrypted_clusters_cluster_type', table_name='encrypted_clusters')
    op.drop_table('encrypted_clusters')
