from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from app.core.base import BaseSchema, PaginationMeta
from app.models.enrollment import EnrollmentStatus

class EnrollmentBase(BaseSchema):
    course_id: int
    user_id: int
    batch_id: Optional[int] = None
    progress: float = 0.0
    current_lesson_id: Optional[int] = None
    purchased_certificate: bool = False
    certificate_id: Optional[int] = None
    payment_id: Optional[int] = None
    enrollment_from_batch: bool = False
    status: EnrollmentStatus = EnrollmentStatus.ACTIVE
    is_active: bool = True
    expires_at: Optional[datetime] = None

class EnrollmentCreate(BaseSchema):
    course_id: int
    user_id: Optional[int] = None
    batch_id: Optional[int] = None
    purchased_certificate: bool = False
    certificate_id: Optional[int] = None
    payment_id: Optional[int] = None
    enrollment_from_batch: bool = False
    status: EnrollmentStatus = EnrollmentStatus.ACTIVE
    is_active: bool = True
    expires_at: Optional[datetime] = None

class EnrollmentUpdate(BaseSchema):
    progress: Optional[float] = None
    current_lesson_id: Optional[int] = None
    purchased_certificate: Optional[bool] = None
    certificate_id: Optional[int] = None
    payment_id: Optional[int] = None
    status: Optional[EnrollmentStatus] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class UserMinRead(BaseModel):
    id: int
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    email: Optional[str] = ""
    full_name: Optional[str] = ""

    model_config = ConfigDict(from_attributes=True)

from app.schemas.user import UserMinimal

class CourseMinRead(BaseModel):
    id: int
    title: str
    slug: Optional[str] = None
    thumbnail: Optional[str] = None
    card_gradient: Optional[str] = None
    total_lessons: int = 0
    paid_course: bool = False
    currency: Optional[str] = None
    course_price: float = 0.0
    enable_certification: bool = False
    paid_certificate: bool = False
    short_introduction: Optional[str] = None
    total_enrollments: int = 0
    rating: float = 0.0
    instructors: list[UserMinimal] = []

    model_config = ConfigDict(from_attributes=True)

class EnrollmentRead(EnrollmentBase):
    id: int
    public_id: str
    enrolled_at: datetime
    completed_at: Optional[datetime] = None
    user: Optional[UserMinRead] = None
    course: Optional[CourseMinRead] = None

    model_config = ConfigDict(from_attributes=True)

class EnrollmentListResponse(BaseModel):
    data: list[EnrollmentRead]
    meta: PaginationMeta

