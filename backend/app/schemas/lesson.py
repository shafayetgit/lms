from pydantic import ConfigDict, Field
from typing import Optional
from datetime import datetime
from enum import Enum
from app.core.base import BaseSchema


class LessonType(str, Enum):
    VIDEO = "video"
    CONTENT = "content"
    QUIZ = "quiz"
    ASSIGNMENT = "assignment"


class LessonBase(BaseSchema):
    chapter_id: str | int  # public_id (UUID) or int — resolved to int FK in service layer
    course_id: str | int   # public_id (UUID) or int — resolved to int FK in service layer
    lesson_type: LessonType = LessonType.VIDEO
    title: str = Field(..., max_length=220)
    slug: Optional[str] = Field(None, max_length=250)
    description: Optional[str] = None

    # video fields
    body: Optional[str] = None
    youtube: Optional[str] = None
    file_type: Optional[str] = None
    duration: Optional[int] = Field(None, ge=0)

    # content field
    content: Optional[str] = None

    # quiz FK
    quiz_id: Optional[int] = None

    # assignment FK
    assignment_id: Optional[int] = None

    order_index: int = Field(0, ge=0)
    instructor_notes: Optional[str] = None
    instructor_content: Optional[str] = None
    include_in_preview: bool = False
    is_scorm_package: bool = False
    is_active: bool = True


class LessonCreate(LessonBase):
    pass


class LessonUpdate(BaseSchema):
    lesson_type: Optional[LessonType] = None
    title: Optional[str] = Field(None, max_length=220)
    slug: Optional[str] = Field(None, max_length=250)
    description: Optional[str] = None
    body: Optional[str] = None
    youtube: Optional[str] = None
    file_type: Optional[str] = None
    duration: Optional[int] = Field(None, ge=0)
    content: Optional[str] = None
    quiz_id: Optional[int] = None
    assignment_id: Optional[int] = None
    order_index: Optional[int] = Field(None, ge=0)
    instructor_notes: Optional[str] = None
    instructor_content: Optional[str] = None
    include_in_preview: Optional[bool] = None
    is_scorm_package: Optional[bool] = None
    is_active: Optional[bool] = None


class LessonRead(LessonBase):
    id: int
    public_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class LessonReadResponse(BaseSchema):
    success: bool = True
    data: LessonRead


class LessonListResponse(BaseSchema):
    data: list[LessonRead]
