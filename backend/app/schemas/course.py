from pydantic import ConfigDict
from typing import Optional
from datetime import datetime
from app.core.base import BaseSchema
from app.models.course import CourseLevel, CourseStatus, CourseLanguage

class CourseBase(BaseSchema):
    title: str
    description: Optional[str] = None
    instructor_id: int
    category_id: Optional[int] = None
    level: CourseLevel = CourseLevel.beginner
    language: CourseLanguage = CourseLanguage.en
    price: float = 0.0
    is_free: bool = False
    is_active: bool = True
    status: CourseStatus = CourseStatus.draft
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None

class CourseCreate(CourseBase):
    slug: Optional[str] = None

class CourseUpdate(BaseSchema):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    instructor_id: Optional[int] = None
    category_id: Optional[int] = None
    level: Optional[CourseLevel] = None
    language: Optional[CourseLanguage] = None
    price: Optional[float] = None
    is_free: Optional[bool] = None
    is_active: Optional[bool] = None
    status: Optional[CourseStatus] = None
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None

class CourseRead(CourseBase):
    id: int
    slug: str
    created_at: datetime
    updated_at: datetime
    avg_rating: float = 0.0
    total_reviews: int = 0
    
    model_config = ConfigDict(from_attributes=True)
