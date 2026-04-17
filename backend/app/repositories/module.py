from sqlalchemy import select
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

async def get_modules_by_course(db: AsyncSession, course_id: int) -> list[Module]:
    result = await db.execute(
        select(Module).where(Module.course_id == course_id).order_by(Module.order_index)
    )
    return result.scalars().all()

async def update_module(db: AsyncSession, module: Module) -> Module:
    await db.commit()
    await db.refresh(module)
    return module

async def delete_module(db: AsyncSession, module: Module):
    await db.delete(module)
    await db.commit()
