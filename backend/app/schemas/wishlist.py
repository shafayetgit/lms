from pydantic import ConfigDict
from datetime import datetime
from app.core.base import BaseSchema
from app.schemas.course import CourseRead

class WishlistBase(BaseSchema):
    course_id: int

class WishlistCreate(WishlistBase):
    pass

class WishlistRead(WishlistBase):
    id: int
    user_id: int
    created_at: datetime
    course: CourseRead 
    
    model_config = ConfigDict(from_attributes=True)
