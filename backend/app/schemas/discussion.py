from pydantic import ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from app.core.base import BaseSchema

class DiscussionBase(BaseSchema):
    title: str = Field(..., max_length=255)
    body: Optional[str] = None
    is_active: bool = True
    is_pinned: bool = False
    is_locked: bool = False
    reference_doctype: Optional[str] = None
    reference_docname: Optional[str] = None

class DiscussionCreate(DiscussionBase):
    course_public_id: str
    lesson_public_id: Optional[str] = None

class DiscussionUpdate(BaseSchema):
    title: Optional[str] = Field(None, max_length=255)
    body: Optional[str] = None
    is_active: Optional[bool] = None
    is_pinned: Optional[bool] = None
    is_locked: Optional[bool] = None

from app.schemas.user import UserMinimal

class DiscussionRead(DiscussionBase):
    id: int
    user_id: int
    course_id: int
    lesson_id: Optional[int] = None
    user: Optional[UserMinimal] = None
    comment_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)
