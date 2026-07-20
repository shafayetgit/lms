from pydantic import ConfigDict
from typing import Optional
from datetime import datetime
from app.core.base import BaseSchema, PaginationMeta


class CategorySimple(BaseSchema):
    public_id: str
    name: str


class InstructorSimple(BaseSchema):
    public_id: str
    first_name: str
    last_name: str


class CourseSimple(BaseSchema):
    public_id: str
    title: str

class RelatedCourseDetail(BaseSchema):
    public_id: str
    title: str
    slug: str
    thumbnail: Optional[str] = None
    avg_rating: float = 0.0
    total_reviews: int = 0
    course_price: Optional[float] = None
    currency: Optional[str] = None
    paid_course: Optional[bool] = None
    total_lessons: int = 0
    category: Optional[CategorySimple] = None
    instructors: list[InstructorSimple] = []
    short_introduction: Optional[str] = None
    card_gradient: Optional[str] = None
    featured: bool = False
    enable_certification: bool = False
    paid_certificate: bool = False

class RelatedCourseSimple(BaseSchema):
    related_course_public_id: str
    order_index: int
    related_course: Optional[RelatedCourseDetail] = None



class CourseBase(BaseSchema):
    title: str
    short_introduction: Optional[str] = None
    overview: Optional[str] = None
    category_public_id: Optional[str] = None
    thumbnail: Optional[str] = None
    video: Optional[str] = None
    tags: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    published: bool = False
    upcoming: bool = False
    featured: bool = False
    disable_self_learning: bool = False
    paid_course: bool = False
    paid_certificate: bool = False
    course_price: float = 0.0
    currency: Optional[str] = None

    enable_certification: bool = False
    card_gradient: Optional[str] = None
    rating: float = 0.0
    total_enrollments: int = 0
    total_lessons: int = 0
    total_quizzes: int = 0
    total_assignments: int = 0

class CourseCreate(CourseBase):
    slug: Optional[str] = None
    instructor_public_ids: list[str]
    related_course_public_ids: Optional[list[str]] = None

class CourseUpdate(BaseSchema):
    title: Optional[str] = None
    slug: Optional[str] = None
    short_introduction: Optional[str] = None
    overview: Optional[str] = None
    category_public_id: Optional[str] = None
    thumbnail: Optional[str] = None
    video: Optional[str] = None
    tags: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    published: Optional[bool] = None
    upcoming: Optional[bool] = None
    featured: Optional[bool] = None
    disable_self_learning: Optional[bool] = None
    paid_course: Optional[bool] = None
    paid_certificate: Optional[bool] = None
    course_price: Optional[float] = None
    currency: Optional[str] = None

    enable_certification: Optional[bool] = None
    card_gradient: Optional[str] = None
    related_course_public_ids: Optional[list[str]] = None
    instructor_public_ids: Optional[list[str]] = None

class CourseRead(CourseBase):
    id: int
    public_id: str
    slug: str
    created_at: datetime
    updated_at: datetime
    avg_rating: float = 0.0
    total_reviews: int = 0
    category: Optional[CategorySimple] = None
    instructors: list[InstructorSimple] = []
    related_courses: list[RelatedCourseSimple] = []

    



class CourseListResponse(BaseSchema):
    data: list[CourseRead]
    meta: PaginationMeta
