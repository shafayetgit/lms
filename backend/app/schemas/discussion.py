from pydantic import ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from app.core.base import BaseSchema

class DiscussionBase(BaseSchema):
    course_id: int
    lesson_id: Optional[int] = None
    title: str = Field(..., max_length=255)
    body: Optional[str] = None
    is_active: bool = True
    is_pinned: bool = False
    is_locked: bool = False

class DiscussionCreate(DiscussionBase):
    pass

class DiscussionUpdate(BaseSchema):
    title: Optional[str] = Field(None, max_length=255)
    body: Optional[str] = None
    is_active: Optional[bool] = None
    is_pinned: Optional[bool] = None
    is_locked: Optional[bool] = None

class DiscussionRead(DiscussionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)
