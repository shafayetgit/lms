from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

from app.schemas.course import CourseSimple


class ProgramCourseBase(BaseModel):
    course_id: int
    order_index: int = 0


class ProgramCourseCreate(ProgramCourseBase):
    pass


class ProgramCourseResponse(ProgramCourseBase):
    id: int
    program_id: int
    course: Optional[CourseSimple] = None

    model_config = ConfigDict(from_attributes=True)


class ProgramMemberBase(BaseModel):
    member_id: int


class ProgramMemberCreate(ProgramMemberBase):
    pass


from app.schemas.user import UserRead


class ProgramMemberResponse(ProgramMemberBase):
    id: int
    program_id: int
    progress: float
    member: Optional[UserRead] = None

    model_config = ConfigDict(from_attributes=True)


class ProgramBase(BaseModel):
    title: str
    description: Optional[str] = None
    published: bool = False
    enforce_course_order: bool = False


class ProgramCreate(ProgramBase):
    courses: Optional[List[ProgramCourseCreate]] = None


class ProgramUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    published: Optional[bool] = None
    enforce_course_order: Optional[bool] = None
    courses: Optional[List[ProgramCourseCreate]] = None


class ProgramResponse(ProgramBase):
    id: int
    public_id: str
    course_count: int
    member_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    courses: List[ProgramCourseResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ProgramDetailResponse(ProgramResponse):
    pass
