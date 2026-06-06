import asyncio
from sqlalchemy import select
from sqlalchemy.orm import joinedload, load_only
from app.models.module import Module
from app.models.course import Course

def test_query():
    q = select(Module).options(
        joinedload(Module.course).load_only(Course.id, Course.title)
    ).where(Module.course_id == 1).order_by(Module.order_index)
    print(q)

test_query()
