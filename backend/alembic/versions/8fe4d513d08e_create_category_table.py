"""create category table

Revision ID: 8fe4d513d08e
Revises: b7aa2dd469a0
Create Date: 2026-04-10 14:47:28.196968

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8fe4d513d08e'
down_revision: Union[str, Sequence[str], None] = 'b7aa2dd469a0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
