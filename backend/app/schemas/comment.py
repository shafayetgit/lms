from pydantic import ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from app.core.base import BaseSchema

class CommentBase(BaseSchema):
    discussion_id: int
    parent_id: Optional[int] = None
    body: str
    is_active: bool = True

class CommentCreate(CommentBase):
    pass

class CommentUpdate(BaseSchema):
    body: Optional[str] = None
    is_active: Optional[bool] = None

from app.schemas.user import UserMinimal

class CommentRead(CommentBase):
    id: int
    user_id: int
    user: Optional[UserMinimal] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class CommentWithReplies(CommentRead):
    replies: List["CommentWithReplies"] = []
    
    model_config = ConfigDict(from_attributes=True)
