from typing import Sequence, Optional
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification

async def create_notification(db: AsyncSession, notification: Notification) -> Notification:
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification

async def get_notification_by_id(db: AsyncSession, id: int | str, user_id: int) -> Optional[Notification]:
    if isinstance(id, int) or (isinstance(id, str) and id.isdigit()):
        query = select(Notification).where(Notification.id == int(id), Notification.user_id == user_id)
    else:
        query = select(Notification).where(Notification.public_id == str(id), Notification.user_id == user_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_notifications_for_user(
    db: AsyncSession, user_id: int, skip: int = 0, limit: int = 10, unread_only: bool = False
) -> Sequence[Notification]:
    query = select(Notification).where(Notification.user_id == user_id)
    if unread_only:
        query = query.where(Notification.read == False)
    query = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def count_notifications_for_user(
    db: AsyncSession, user_id: int, unread_only: bool = False
) -> int:
    query = select(func.count(Notification.id)).where(Notification.user_id == user_id)
    if unread_only:
        query = query.where(Notification.read == False)
    result = await db.execute(query)
    return result.scalar() or 0

async def mark_notification_as_read(db: AsyncSession, notification: Notification) -> Notification:
    notification.read = True
    await db.commit()
    await db.refresh(notification)
    return notification

async def mark_all_notifications_as_read(db: AsyncSession, user_id: int) -> None:
    query = update(Notification).where(
        Notification.user_id == user_id,
        Notification.read == False
    ).values(read=True)
    await db.execute(query)
    await db.commit()
