from pydantic import ConfigDict, Field
from typing import Optional
from datetime import datetime
from app.core.base import BaseSchema
from app.schemas.course import CourseSimple


class ChapterBase(BaseSchema):
    course_id: str | int  # public_id (UUID) or int — resolved to int FK in service layer
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    order_index: int = Field(0, ge=0)
    is_active: bool = True

    is_scorm_package: bool = False


class ChapterCreate(ChapterBase):
    pass


class ChapterUpdate(BaseSchema):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    order_index: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class ChapterRead(ChapterBase):
    id: int
    public_id: str
    created_at: datetime
    updated_at: datetime
    course: Optional[CourseSimple] = None

    model_config = ConfigDict(from_attributes=True)


class ChapterReadResponse(BaseSchema):
    success: bool = True
    data: ChapterRead


class ChapterListResponse(BaseSchema):
    success: bool = True
    data: list[ChapterRead]
