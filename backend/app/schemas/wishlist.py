from pydantic import ConfigDict
from datetime import datetime
from app.core.base import BaseSchema
from app.schemas.course import CourseRead

class WishlistBase(BaseSchema):
    course_public_id: str

class WishlistCreate(WishlistBase):
    pass

class WishlistRead(WishlistBase):
    public_id: str
    user_public_id: str
    created_at: datetime
    course: CourseRead 
    
    model_config = ConfigDict(from_attributes=True)
