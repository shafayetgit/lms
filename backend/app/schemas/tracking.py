from typing import Optional, List
from pydantic import BaseModel, ConfigDict, EmailStr

# ---------------- LESSON NOTES ---------------- #
class LessonNoteBase(BaseModel):
    note: str

class LessonNoteCreate(LessonNoteBase):
    lesson_public_id: str

class LessonNoteUpdate(LessonNoteBase):
    pass

class LessonNoteRead(LessonNoteBase):
    public_id: str
    lesson_public_id: str

class LessonNoteReadResponse(BaseModel):
    success: bool = True
    data: LessonNoteRead


# ---------------- WATCH DURATION ---------------- #
class WatchDurationUpdate(BaseModel):
    lesson_id: int
    duration_seconds: int

class WatchDurationResponse(BaseModel):
    id: int
    member_id: int
    lesson_id: int
    duration_seconds: int

    model_config = ConfigDict(from_attributes=True)


# ---------------- COURSE INTEREST ---------------- #
class CourseInterestCreate(BaseModel):
    course_id: int
    user_email: EmailStr

class CourseInterestResponse(CourseInterestCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


# ---------------- RELATED COURSES ---------------- #
class RelatedCourseCreate(BaseModel):
    related_course_id: int
    order_index: int = 0

class RelatedCoursesBulkUpdate(BaseModel):
    related_courses: List[RelatedCourseCreate]

class RelatedCourseResponse(BaseModel):
    id: int
    course_id: int
    related_course_id: int
    order_index: int

    model_config = ConfigDict(from_attributes=True)
