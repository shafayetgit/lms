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
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    __table_args__ = (
        # one progress per user per lesson
        UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson_progress"),

        # optimized queries
        Index("idx_progress_user", "user_id"),
        Index("idx_progress_lesson", "lesson_id"),
        Index("idx_progress_user_updated", "user_id", "updated_at"),
        Index("idx_progress_updated_at", "updated_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    # 🔗 relationships
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True
    )

    lesson_id: Mapped[int] = mapped_column(
        ForeignKey("lessons.id", ondelete="CASCADE"),
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

    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))


    # 🔗 ORM relationships
    user = relationship("User", back_populates="lesson_progress")
    lesson = relationship("Lesson", back_populates="progress_records")