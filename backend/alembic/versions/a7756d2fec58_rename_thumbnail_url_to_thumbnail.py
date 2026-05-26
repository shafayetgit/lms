"""rename thumbnail_url to thumbnail

Revision ID: a7756d2fec58
Revises: c2ea6012ad25
Create Date: 2026-05-26 02:01:38.111923

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a7756d2fec58"
down_revision: Union[str, Sequence[str], None] = "c2ea6012ad25"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "courses",  # ← your table name
        "thumbnail_url",  # ← current name in DB
        new_column_name="thumbnail",  # ← new name in model
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "courses",  # ← your table name
        "thumbnail",  # ← current name in DB
        new_column_name="thumbnail_url",  # ← old name in model
    )
