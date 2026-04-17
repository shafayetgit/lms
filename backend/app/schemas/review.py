from pydantic import ConfigDict, Field
from typing import Optional
from datetime import datetime
from app.core.base import BaseSchema

class ReviewBase(BaseSchema):
    course_id: int
    student_id: int
    rating: int = Field(..., ge=1, le=5)
    body: Optional[str] = None
    is_active: bool = True

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseSchema):
    rating: Optional[int] = Field(None, ge=1, le=5)
    body: Optional[str] = None
    is_active: Optional[bool] = None

class ReviewRead(ReviewBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
