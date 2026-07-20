from typing import Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.models.notification import Notification
from app.repositories import notification as notification_repo

async def create_notification(
    db: AsyncSession, user_id: int, title: str, message: str, link: Optional[str] = None
) -> Notification:
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        link=link,
        read=False
    )
    return await notification_repo.create_notification(db, notification)

async def get_notifications_for_user(
    db: AsyncSession, user_id: int, skip: int = 0, limit: int = 10, unread_only: bool = False
) -> Sequence[Notification]:
    return await notification_repo.get_notifications_for_user(
        db, user_id, skip=skip, limit=limit, unread_only=unread_only
    )

async def count_notifications_for_user(
    db: AsyncSession, user_id: int, unread_only: bool = False
) -> int:
    return await notification_repo.count_notifications_for_user(
        db, user_id, unread_only=unread_only
    )

async def mark_as_read(db: AsyncSession, notification_id: int | str, user_id: int) -> Notification:
    notification = await notification_repo.get_notification_by_id(db, notification_id, user_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return await notification_repo.mark_notification_as_read(db, notification)

async def mark_all_as_read(db: AsyncSession, user_id: int) -> None:
    await notification_repo.mark_all_notifications_as_read(db, user_id)
