from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

from sqlalchemy import (
    ForeignKey,
    String,
    Text,
    DateTime,
    func,
    Boolean,
    Integer,
    Index,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.module import Module
    from app.models.lesson_progress import LessonProgress
    from app.models.discussion import Discussion
    from app.models.quiz import Quiz


class Lesson(Base):
    __tablename__ = "lessons"

    __table_args__ = (
        # Prevent duplicate ordering inside a module
        UniqueConstraint("module_id", "order_index", name="uq_module_lesson_order"),
        # Fast module-based fetching
        Index("idx_lessons_module_id", "module_id"),
        # Optimized ordering query
        Index("idx_lessons_module_order", "module_id", "order_index"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    # 🔗 Relations
    module_id: Mapped[int] = mapped_column(
        ForeignKey("modules.id", ondelete="CASCADE"), index=True
    )

    # 🧠 Core content
    title: Mapped[str] = mapped_column(String(220))
    slug: Mapped[str] = mapped_column(String(250), index=True)

    description: Mapped[Optional[str]] = mapped_column(Text)

    # 🎥 Learning content (most important part)
    video_url: Mapped[Optional[str]] = mapped_column(Text)
    content: Mapped[Optional[str]] = mapped_column(Text)  # rich text / markdown

    # ⏱️ Duration in seconds (better than minutes for lessons)
    duration: Mapped[Optional[int]] = mapped_column()

    # 📊 Ordering inside module
    order_index: Mapped[int] = mapped_column(default=0)

    # ⚙️ Control flags
    is_preview: Mapped[bool] = mapped_column(default=False)  # free preview lesson
    is_active: Mapped[bool] = mapped_column(default=True, index=True)

    # 🕒 timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True
    )

    # 🔗 relationships
    module = relationship("Module", back_populates="lessons")
    progress_records = relationship(
        "LessonProgress", back_populates="lesson", cascade="all, delete-orphan"
    )

    discussions = relationship(
        "Discussion", back_populates="lesson", cascade="all, delete-orphan"
    )
    quizzes: Mapped[List["Quiz"]] = relationship(
        "Quiz", back_populates="lesson", cascade="all, delete-orphan"
    )
