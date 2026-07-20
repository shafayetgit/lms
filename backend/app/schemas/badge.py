from datetime import datetime
from typing import Optional
from app.core.base import BaseSchema, PaginationMeta

# ---------------- BADGES ---------------- #

class BadgeBase(BaseSchema):
    title: str
    description: Optional[str] = None
    image: Optional[str] = None
    is_active: bool = True
    reference_table: Optional[str] = None
    event: Optional[str] = None
    user_field: Optional[str] = None
    field_to_check: Optional[str] = None
    condition: Optional[str] = None
    grant_only_once: bool = True

class BadgeCreate(BadgeBase):
    pass

class BadgeUpdate(BaseSchema):
    title: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    is_active: Optional[bool] = None
    reference_table: Optional[str] = None
    event: Optional[str] = None
    user_field: Optional[str] = None
    field_to_check: Optional[str] = None
    condition: Optional[str] = None
    grant_only_once: Optional[bool] = None

class BadgeRead(BadgeBase):
    id: int
    public_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

class BadgeReadResponse(BaseSchema):
    success: bool = True
    data: BadgeRead

# Keep legacy name for backward compatibility
class BadgeResponse(BadgeRead):
    pass

class BadgeListResponse(BaseSchema):
    success: bool = True
    data: list[BadgeRead]
    meta: PaginationMeta


from app.schemas.user import UserMinimal

# ---------------- ASSIGNMENTS ---------------- #

class BadgeAssignmentCreate(BaseSchema):
    badge_public_id: str
    member_public_id: str

class BadgeAssignmentRead(BaseSchema):
    id: int
    public_id: str
    badge_id: int
    member_id: int
    assigned_by_id: Optional[int] = None
    created_at: datetime
    badge: Optional[BadgeRead] = None
    member: Optional[UserMinimal] = None

class BadgeAssignmentReadResponse(BaseSchema):
    success: bool = True
    data: BadgeAssignmentRead

# Keep legacy name for backward compatibility
class BadgeAssignmentResponse(BadgeAssignmentRead):
    pass

class BadgeAssignmentListResponse(BaseSchema):
    success: bool = True
    data: list[BadgeAssignmentRead]
    meta: PaginationMeta
