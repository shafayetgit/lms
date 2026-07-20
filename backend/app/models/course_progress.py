from datetime import datetime
from typing import Optional

from sqlalchemy import (
    ForeignKey,
    DateTime,
    func,
    Boolean,
    Integer,
    UniqueConstraint,
    Index,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CourseProgress(Base):
    __tablename__ = "course_progress"

    __table_args__ = (
        # one progress per user per lesson
        UniqueConstraint("user_id", "lesson_id", name="uq_user_course_progress"),

        # optimized queries
        Index("idx_course_progress_user", "user_id"),
        Index("idx_course_progress_lesson", "lesson_id"),
        Index("idx_course_progress_user_updated", "user_id", "updated_at"),
        Index("idx_course_progress_updated_at", "updated_at"),
    )

    # 🔗 relationships
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True
    )

    lesson_id: Mapped[int] = mapped_column(
        ForeignKey("lessons.id", ondelete="CASCADE"),
        index=True
    )

    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"),
        index=True
    )

    # ⏱️ progress tracking
    current_time: Mapped[int] = mapped_column(default=0)
    # seconds watched (important for resume playback)

    is_completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        index=True
    )
    status: Mapped[str] = mapped_column(String(50), default="Incomplete")

    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))


    # 🔗 ORM relationships
    user = relationship("User", back_populates="course_progress")
    lesson = relationship("Lesson", back_populates="progress_records")