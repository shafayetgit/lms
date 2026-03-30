"""add 2fa and oauth fields to users table

Revision ID: e1a2b3c4d5e6
Revises: d9c41349c95e
Create Date: 2026-03-30 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e1a2b3c4d5e6'
down_revision: Union[str, Sequence[str], None] = 'd9c41349c95e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema with 2FA and OAuth fields."""
    # 2FA related fields
    op.add_column('users', sa.Column('two_factor_method', sa.String(length=20), nullable=True))
    op.add_column('users', sa.Column('totp_secret', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('backup_codes', sa.String(length=500), nullable=True))
    op.add_column('users', sa.Column('phone_number', sa.String(length=20), nullable=True))
    
    # Login management fields
    op.add_column('users', sa.Column('login_attempts', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('last_failed_login', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('is_locked', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('locked_until', sa.DateTime(timezone=True), nullable=True))
    
    # OAuth2 integration fields
    op.add_column('users', sa.Column('google_id', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('google_email', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('github_id', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('github_username', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('oauth_provider', sa.String(length=50), nullable=True))
    
    # Create unique constraints for OAuth IDs
    op.create_unique_constraint('uq_users_google_id', 'users', ['google_id'])
    op.create_unique_constraint('uq_users_github_id', 'users', ['github_id'])


def downgrade() -> None:
    """Downgrade schema by removing 2FA and OAuth fields."""
    # Drop unique constraints
    op.drop_constraint('uq_users_github_id', 'users', type_='unique')
    op.drop_constraint('uq_users_google_id', 'users', type_='unique')
    
    # Remove OAuth fields
    op.drop_column('users', 'oauth_provider')
    op.drop_column('users', 'github_username')
    op.drop_column('users', 'github_id')
    op.drop_column('users', 'google_email')
    op.drop_column('users', 'google_id')
    
    # Remove login management fields
    op.drop_column('users', 'locked_until')
    op.drop_column('users', 'is_locked')
    op.drop_column('users', 'last_failed_login')
    op.drop_column('users', 'login_attempts')
    
    # Remove 2FA fields
    op.drop_column('users', 'phone_number')
    op.drop_column('users', 'backup_codes')
    op.drop_column('users', 'totp_secret')
    op.drop_column('users', 'two_factor_method')
