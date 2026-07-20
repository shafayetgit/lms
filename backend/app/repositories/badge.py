from typing import Sequence, Optional
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.badge import Badge, BadgeAssignment

# ---------------- BADGES ---------------- #

async def create_badge(db: AsyncSession, badge: Badge) -> Badge:
    db.add(badge)
    await db.commit()
    await db.refresh(badge)
    return badge

async def get_badge_by_id(db: AsyncSession, id: int) -> Optional[Badge]:
    query = select(Badge).where(Badge.id == id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_badge_by_public_id(db: AsyncSession, public_id: str) -> Optional[Badge]:
    query = select(Badge).where(Badge.public_id == public_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_badge_by_title(db: AsyncSession, title: str) -> Optional[Badge]:
    query = select(Badge).where(Badge.title == title)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_badges(db: AsyncSession, skip: int = 0, limit: int = 10, is_active: Optional[bool] = None) -> Sequence[Badge]:
    query = select(Badge)
    if is_active is not None:
        query = query.where(Badge.is_active == is_active)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def count_badges(db: AsyncSession, is_active: Optional[bool] = None) -> int:
    query = select(func.count(Badge.id))
    if is_active is not None:
        query = query.where(Badge.is_active == is_active)
    result = await db.execute(query)
    return result.scalar() or 0

async def update_badge(db: AsyncSession, badge: Badge) -> Badge:
    await db.commit()
    await db.refresh(badge)
    return badge

async def delete_badge(db: AsyncSession, badge: Badge) -> None:
    await db.delete(badge)
    await db.commit()

async def get_active_badges_for_event(db: AsyncSession, reference_table: str, event: str) -> Sequence[Badge]:
    query = select(Badge).where(
        Badge.is_active == True,
        Badge.reference_table == reference_table,
        Badge.event == event
    )
    result = await db.execute(query)
    return result.scalars().all()


# ---------------- ASSIGNMENTS ---------------- #

async def create_assignment(db: AsyncSession, assignment: BadgeAssignment) -> BadgeAssignment:
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)
    query = select(BadgeAssignment).options(
        selectinload(BadgeAssignment.badge),
        selectinload(BadgeAssignment.member)
    ).where(BadgeAssignment.id == assignment.id)
    result = await db.execute(query)
    return result.scalar_one()

async def get_assignment_by_member_and_badge(db: AsyncSession, member_id: int, badge_id: int) -> Optional[BadgeAssignment]:
    query = select(BadgeAssignment).where(
        BadgeAssignment.member_id == member_id,
        BadgeAssignment.badge_id == badge_id
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_assignment_by_id(db: AsyncSession, id: int) -> Optional[BadgeAssignment]:
    query = select(BadgeAssignment).where(BadgeAssignment.id == id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_assignment_by_public_id(db: AsyncSession, public_id: str) -> Optional[BadgeAssignment]:
    query = select(BadgeAssignment).where(BadgeAssignment.public_id == public_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_assignments(
    db: AsyncSession, skip: int = 0, limit: int = 10, member_id: Optional[int] = None, badge_id: Optional[int] = None
) -> Sequence[BadgeAssignment]:
    query = select(BadgeAssignment).options(
        selectinload(BadgeAssignment.badge),
        selectinload(BadgeAssignment.member)
    )
    if member_id is not None:
        query = query.where(BadgeAssignment.member_id == member_id)
    if badge_id is not None:
        query = query.where(BadgeAssignment.badge_id == badge_id)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def count_assignments(
    db: AsyncSession, member_id: Optional[int] = None, badge_id: Optional[int] = None
) -> int:
    query = select(func.count(BadgeAssignment.id))
    if member_id is not None:
        query = query.where(BadgeAssignment.member_id == member_id)
    if badge_id is not None:
        query = query.where(BadgeAssignment.badge_id == badge_id)
    result = await db.execute(query)
    return result.scalar() or 0

async def delete_assignment(db: AsyncSession, assignment: BadgeAssignment) -> None:
    await db.delete(assignment)
    await db.commit()
