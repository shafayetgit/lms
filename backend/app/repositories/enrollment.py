from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from typing import List, Optional
from app.models.enrollment import Enrollment

async def create_enrollment(db: AsyncSession, enrollment: Enrollment) -> Enrollment:
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    return enrollment

async def get_enrollment_by_id(db: AsyncSession, enrollment_id: int) -> Optional[Enrollment]:
    result = await db.execute(select(Enrollment).where(Enrollment.id == enrollment_id))
    return result.scalars().first()

async def get_enrollment_by_user_and_course(
    db: AsyncSession, user_id: int, course_id: int
) -> Optional[Enrollment]:
    result = await db.execute(
        select(Enrollment).where(
            and_(Enrollment.user_id == user_id, Enrollment.course_id == course_id)
        )
    )
    return result.scalars().first()

async def get_enrollments_by_user(
    db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100
) -> List[Enrollment]:
    result = await db.execute(
        select(Enrollment)
        .where(Enrollment.user_id == user_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_enrollments_by_course(
    db: AsyncSession, course_id: int, skip: int = 0, limit: int = 100
) -> List[Enrollment]:
    result = await db.execute(
        select(Enrollment)
        .where(Enrollment.course_id == course_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def update_enrollment(db: AsyncSession, enrollment: Enrollment) -> Enrollment:
    await db.commit()
    await db.refresh(enrollment)
    return enrollment

async def delete_enrollment(db: AsyncSession, enrollment: Enrollment) -> None:
    await db.delete(enrollment)
    await db.commit()
