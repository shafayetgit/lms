from pydantic import ConfigDict, Field
from typing import Optional
from datetime import datetime
from app.core.base import BaseSchema

class LessonBase(BaseSchema):
    module_id: int
    title: str = Field(..., max_length=220)
    slug: Optional[str] = Field(None, max_length=250)
    description: Optional[str] = None
    video_url: Optional[str] = None
    content: Optional[str] = None
    duration: Optional[int] = Field(None, ge=0)
    order_index: int = Field(0, ge=0)
    is_preview: bool = False
    is_active: bool = True

class LessonCreate(LessonBase):
    pass

class LessonUpdate(BaseSchema):
    title: Optional[str] = Field(None, max_length=220)
    slug: Optional[str] = Field(None, max_length=250)
    description: Optional[str] = None
    video_url: Optional[str] = None
    content: Optional[str] = None
    duration: Optional[int] = Field(None, ge=0)
    order_index: Optional[int] = Field(None, ge=0)
    is_preview: Optional[bool] = None
    is_active: Optional[bool] = None

class LessonRead(LessonBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)
