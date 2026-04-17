from pydantic import ConfigDict
from datetime import datetime
from typing import Optional
from app.core.base import BaseSchema
from app.models.enrollment import EnrollmentStatus

class EnrollmentBase(BaseSchema):
    course_id: int
    status: EnrollmentStatus = EnrollmentStatus.ACTIVE
    is_active: bool = True
    expires_at: Optional[datetime] = None

class EnrollmentCreate(EnrollmentBase):
    user_id: int

class EnrollmentUpdate(BaseSchema):
    status: Optional[EnrollmentStatus] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class EnrollmentRead(EnrollmentBase):
    id: int
    user_id: int
    enrolled_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
