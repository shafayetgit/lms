from shlex import join

from app.models.course import Course
from sqlalchemy import select, Select
from sqlalchemy.orm import joinedload

from sqlalchemy.ext.asyncio import AsyncSession
from app.models.module import Module


async def create_module(db: AsyncSession, module: Module) -> Module:
    db.add(module)
    await db.commit()
    await db.refresh(module)
    return module


async def get_module_by_id(db: AsyncSession, module_id: int) -> Module | None:
    result = await db.execute(select(Module).where(Module.id == module_id))
    return result.scalars().first()


async def get_modules_by_course(
    db: AsyncSession, course_id: int, query: Select | None = None
) -> list[Module]:
    q = (
        query
        if query is not None
        else select(Module).options(
            joinedload(Module.course).load_only(Course.id, Course.title)
        )
    )
    q = q.where(Module.course_id == course_id).order_by(Module.order_index)
    result = await db.execute(q)
    return result.scalars().all()


async def update_module(db: AsyncSession, module: Module) -> Module:
    await db.commit()
    await db.refresh(module)
    return module


async def delete_module(db: AsyncSession, module: Module):
    await db.delete(module)
    await db.commit()
