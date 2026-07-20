from typing import Optional, TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.course import Course
    from app.models.lesson import Lesson

class LessonNote(Base):
    __tablename__ = "lesson_notes"

    member_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"))
    note: Mapped[str] = mapped_column(Text)

    # Relationships
    member: Mapped["User"] = relationship("User", back_populates="lesson_notes")
    lesson: Mapped["Lesson"] = relationship("Lesson", back_populates="notes")


class VideoWatchDuration(Base):
    __tablename__ = "video_watch_durations"

    member_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"))
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    member: Mapped["User"] = relationship("User", back_populates="watch_durations")
    lesson: Mapped["Lesson"] = relationship("Lesson", back_populates="watch_durations")


class CourseInterest(Base):
    __tablename__ = "course_interests"

    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"))
    user_email: Mapped[str] = mapped_column(String(255), index=True)

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="interests")


class RelatedCourse(Base):
    __tablename__ = "related_courses"

    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"))
    related_course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"))
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    course: Mapped["Course"] = relationship("Course", foreign_keys=[course_id], back_populates="related_courses")
    related_course: Mapped["Course"] = relationship("Course", foreign_keys=[related_course_id])

    @property
    def related_course_public_id(self) -> str:
        return self.related_course.public_id if self.related_course else None

