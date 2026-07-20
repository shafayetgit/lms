from datetime import datetime
from typing import Optional, TYPE_CHECKING
import enum

from sqlalchemy import (
    ForeignKey,
    String,
    Text,
    DateTime,
    func,
    Boolean,
    Index,
    UniqueConstraint,
    Enum as SQLEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.chapter import Chapter
    from app.models.course_progress import CourseProgress
    from app.models.discussion import Discussion
    from app.models.quiz import Quiz
    from app.models.assignment import Assignment


class LessonType(str, enum.Enum):
    VIDEO = "video"
    CONTENT = "content"
    QUIZ = "quiz"
    ASSIGNMENT = "assignment"


class Lesson(Base):
    __tablename__ = "lessons"

    __table_args__ = (
        UniqueConstraint("chapter_id", "order_index", name="uq_chapter_lesson_order"),
        UniqueConstraint("chapter_id", "slug", name="uq_chapter_lesson_slug"),
        Index("idx_lessons_chapter_id", "chapter_id"),
        Index("idx_lessons_chapter_order", "chapter_id", "order_index"),
    )

    chapter_id: Mapped[int] = mapped_column(
        ForeignKey("chapters.id", ondelete="CASCADE"), index=True
    )
    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), index=True
    )

    # Lesson type discriminator (video | content | quiz | assignment)
    lesson_type: Mapped[LessonType] = mapped_column(
        SQLEnum(LessonType, name="lesson_type_enum", values_callable=lambda x: [e.value for e in x]),
        default=LessonType.VIDEO,
        index=True,
    )

    title: Mapped[str] = mapped_column(String(220))
    slug: Mapped[str] = mapped_column(String(250), index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)

    # --- video type fields ---
    body: Mapped[Optional[str]] = mapped_column(Text)
    youtube: Mapped[Optional[str]] = mapped_column(Text)
    file_type: Mapped[Optional[str]] = mapped_column(String(50))
    duration: Mapped[Optional[int]] = mapped_column()

    # --- content type field ---
    content: Mapped[Optional[str]] = mapped_column(Text)

    # --- quiz type FK ---
    quiz_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("quizzes.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # --- assignment type FK ---
    assignment_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("assignments.id", ondelete="SET NULL"), nullable=True, index=True
    )

    instructor_notes: Mapped[Optional[str]] = mapped_column(Text)
    instructor_content: Mapped[Optional[str]] = mapped_column(Text)

    order_index: Mapped[int] = mapped_column(default=0)

    include_in_preview: Mapped[bool] = mapped_column(default=False)
    is_scorm_package: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(default=True, index=True)

    # Relationships
    chapter = relationship("Chapter", back_populates="lessons")
    course = relationship("Course")
    quiz: Mapped[Optional["Quiz"]] = relationship(
        "Quiz", foreign_keys=[quiz_id]
    )
    assignment: Mapped[Optional["Assignment"]] = relationship(
        "Assignment", foreign_keys=[assignment_id]
    )
    progress = relationship(
        "CourseProgress", back_populates="lesson", cascade="all, delete-orphan"
    )
    notes = relationship("LessonNote", back_populates="lesson", cascade="all, delete-orphan")
    watch_durations = relationship(
        "VideoWatchDuration", back_populates="lesson", cascade="all, delete-orphan"
    )
    progress_records = relationship(
        "CourseProgress",
        back_populates="lesson",
        cascade="all, delete-orphan",
        overlaps="progress",
    )
    discussions = relationship(
        "Discussion", back_populates="lesson", cascade="all, delete-orphan"
    )
