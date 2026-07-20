from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.notification import (
    NotificationReadResponse,
    NotificationListResponse,
)
from app.services import notification as notification_svc

router = APIRouter()

@router.get("/", response_model=NotificationListResponse)
async def read_notifications(
    db: AsyncSession = Depends(get_db),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    unread_only: bool = False,
    current_user: User = Depends(get_current_user)
) -> Any:
    skip = (page - 1) * size
    total = await notification_svc.count_notifications_for_user(
        db, user_id=current_user.id, unread_only=unread_only
    )
    notifications = await notification_svc.get_notifications_for_user(
        db, user_id=current_user.id, skip=skip, limit=size, unread_only=unread_only
    )
    pages = (total + size - 1) // size if size else 1

    return {
        "success": True,
        "data": notifications,
        "meta": {
            "total": total,
            "page": page,
            "size": size,
            "pages": pages,
            "has_next": page < pages,
            "has_prev": page > 1,
        }
    }

@router.put("/read-all")
async def mark_all_notifications_as_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    await notification_svc.mark_all_as_read(db, user_id=current_user.id)
    return {
        "success": True,
        "data": {}
    }

@router.put("/{public_id}/read", response_model=NotificationReadResponse)
async def mark_notification_as_read(
    *,
    db: AsyncSession = Depends(get_db),
    public_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    notification = await notification_svc.mark_as_read(
        db, notification_id=public_id, user_id=current_user.id
    )
    return {
        "success": True,
        "data": notification
    }
