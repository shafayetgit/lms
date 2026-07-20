from typing import Sequence, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.live_class import LiveClass

async def create_live_class(db: AsyncSession, live_class: LiveClass) -> LiveClass:
    db.add(live_class)
    await db.commit()
    await db.refresh(live_class)
    return live_class

async def get_live_class_by_id(db: AsyncSession, id: int) -> Optional[LiveClass]:
    query = select(LiveClass).where(LiveClass.id == id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_live_classes(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 10,
    batch_id: Optional[int] = None,
    course_id: Optional[int] = None,
    host_id: Optional[int] = None,
    status: Optional[str] = None
) -> Sequence[LiveClass]:
    query = select(LiveClass)
    if batch_id is not None:
        query = query.where(LiveClass.batch_id == batch_id)
    if course_id is not None:
        query = query.where(LiveClass.course_id == course_id)
    if host_id is not None:
        query = query.where(LiveClass.host_id == host_id)
    if status is not None:
        query = query.where(LiveClass.status == status)
    
    query = query.order_by(LiveClass.date.desc(), LiveClass.time.desc())
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()

async def count_live_classes(
    db: AsyncSession,
    batch_id: Optional[int] = None,
    course_id: Optional[int] = None,
    host_id: Optional[int] = None,
    status: Optional[str] = None
) -> int:
    query = select(func.count(LiveClass.id))
    if batch_id is not None:
        query = query.where(LiveClass.batch_id == batch_id)
    if course_id is not None:
        query = query.where(LiveClass.course_id == course_id)
    if host_id is not None:
        query = query.where(LiveClass.host_id == host_id)
    if status is not None:
        query = query.where(LiveClass.status == status)
        
    result = await db.execute(query)
    return result.scalar() or 0

async def update_live_class(db: AsyncSession, live_class: LiveClass) -> LiveClass:
    await db.commit()
    await db.refresh(live_class)
    return live_class

async def delete_live_class(db: AsyncSession, live_class: LiveClass) -> None:
    await db.delete(live_class)
    await db.commit()
