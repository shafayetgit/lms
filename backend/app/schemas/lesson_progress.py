from pydantic import ConfigDict
from typing import Optional
from datetime import datetime
from app.core.base import BaseSchema

class LessonProgressBase(BaseSchema):
    lesson_id: int
    current_time: int = 0
    is_completed: bool = False

class LessonProgressCreate(LessonProgressBase):
    pass

class LessonProgressUpdate(BaseSchema):
    current_time: Optional[int] = None
    is_completed: Optional[bool] = None
    completed_at: Optional[datetime] = None

class LessonProgressRead(LessonProgressBase):
    id: int
    user_id: int
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
