"""refactor oauth to separate table

Refactors OAuth integration from embedded user fields to a separate oauth_accounts table.
This allows users to link multiple OAuth providers to a single account.

Revision ID: f2b3c4d5e6f7
Revises: e1a2b3c4d5e6
Create Date: 2026-03-30 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f2b3c4d5e6f7'
down_revision: Union[str, Sequence[str], None] = 'e1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - create oauth_accounts table and remove OAuth fields from users."""
    
    # Create oauth_accounts table
    op.create_table(
        'oauth_accounts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('provider', sa.String(length=50), nullable=False),
        sa.Column('provider_user_id', sa.String(length=255), nullable=False),
        sa.Column('provider_email', sa.String(length=255), nullable=True),
        sa.Column('profile_data', sa.JSON(), nullable=True),
        sa.Column('linked_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'provider', name='uq_oauth_user_provider'),
        sa.UniqueConstraint('provider', 'provider_user_id', name='uq_oauth_provider_id'),
    )
    
    # Create index for faster lookups
    op.create_index('ix_oauth_accounts_user_id', 'oauth_accounts', ['user_id'])
    op.create_index('ix_oauth_accounts_provider', 'oauth_accounts', ['provider'])
    
    # Drop old unique constraints from users table
    op.drop_constraint('uq_users_github_id', 'users', type_='unique')
    op.drop_constraint('uq_users_google_id', 'users', type_='unique')
    
    # Remove old OAuth columns from users table
    op.drop_column('users', 'oauth_provider')
    op.drop_column('users', 'github_username')
    op.drop_column('users', 'github_id')
    op.drop_column('users', 'google_email')
    op.drop_column('users', 'google_id')


def downgrade() -> None:
    """Downgrade schema - restore OAuth fields to users table and drop oauth_accounts table."""
    
    # Add OAuth columns back to users table
    op.add_column('users', sa.Column('google_id', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('google_email', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('github_id', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('github_username', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('oauth_provider', sa.String(length=50), nullable=True))
    
    # Recreate unique constraints
    op.create_unique_constraint('uq_users_google_id', 'users', ['google_id'])
    op.create_unique_constraint('uq_users_github_id', 'users', ['github_id'])
    
    # Drop oauth_accounts table
    op.drop_table('oauth_accounts')
