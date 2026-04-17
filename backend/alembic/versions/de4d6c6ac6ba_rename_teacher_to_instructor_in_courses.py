"""Rename teacher to instructor in courses

Revision ID: de4d6c6ac6ba
Revises: 516088866238
Create Date: 2026-04-10 19:46:28.274244

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'de4d6c6ac6ba'
down_revision: Union[str, Sequence[str], None] = '516088866238'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Rename column
    op.alter_column('courses', 'teacher_id', new_column_name='instructor_id')
    
    # Update indexes
    op.drop_index('ix_courses_teacher_id', table_name='courses')
    op.create_index(op.f('ix_courses_instructor_id'), 'courses', ['instructor_id'], unique=False)


def downgrade() -> None:
    # Rename back
    op.alter_column('courses', 'instructor_id', new_column_name='teacher_id')
    
    # Update indexes
    op.drop_index('ix_courses_instructor_id', table_name='courses')
    op.create_index(op.f('ix_courses_teacher_id'), 'courses', ['teacher_id'], unique=False)
