from datetime import datetime
from typing import Optional
from app.core.base import BaseSchema, PaginationMeta

class NotificationBase(BaseSchema):
    title: str
    message: str
    link: Optional[str] = None
    read: bool = False

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationRead(NotificationBase):
    public_id: str
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class NotificationReadResponse(BaseSchema):
    success: bool = True
    data: NotificationRead

class NotificationListResponse(BaseSchema):
    success: bool = True
    data: list[NotificationRead]
    meta: PaginationMeta
