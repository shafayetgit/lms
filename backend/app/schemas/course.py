from pydantic import ConfigDict
from typing import Optional
from datetime import datetime
from app.core.base import BaseSchema, PaginationMeta
from app.models.course import CourseLevel, CourseBadge, CourseLanguage

class CategorySimple(BaseSchema):
    id: int
    name: str


class InstructorSimple(BaseSchema):
    id: int
    first_name: str
    last_name: str


class CourseSimple(BaseSchema):
    id: int
    title: str



class CourseBase(BaseSchema):
    title: str
    description: Optional[str] = None
    instructor_id: int
    category_id: Optional[int] = None
    level: CourseLevel = CourseLevel.BEGINNER
    language: CourseLanguage = CourseLanguage.EN
    price: float = 0.0
    is_free: bool = False
    is_active: bool = True
    badge: CourseBadge = CourseBadge.NONE
    thumbnail: Optional[str] = None
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
    badge: Optional[CourseBadge] = None
    thumbnail: Optional[str] = None
    duration: Optional[int] = None

class CourseRead(CourseBase):
    id: int
    slug: str
    created_at: datetime
    updated_at: datetime
    avg_rating: float = 0.0
    total_reviews: int = 0
    category: Optional[CategorySimple] = None
    instructor: Optional[InstructorSimple] = None
    



class CourseListResponse(BaseSchema):
    data: list[CourseRead]
    meta: PaginationMeta
