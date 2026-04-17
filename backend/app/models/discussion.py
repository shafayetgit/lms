from datetime import datetime
from typing import Optional

from sqlalchemy import (
    ForeignKey,
    String,
    Text,
    DateTime,
    func,
    Boolean,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Discussion(Base):
    __tablename__ = "discussions"

    __table_args__ = (
        Index("idx_discussion_course", "course_id"),
        Index("idx_discussion_lesson", "lesson_id"),
        Index("idx_discussion_user", "user_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    # 🔗 relations
    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"),
        index=True
    )

    lesson_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("lessons.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True
    )

    # 🧠 content
    title: Mapped[str] = mapped_column(String(255))
    body: Mapped[Optional[str]] = mapped_column(Text)

    # ⚙️ control
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    is_locked: Mapped[bool] = mapped_column(Boolean, default=False)

    # 🔗 relationships
    user = relationship("User", back_populates="discussions")
    course = relationship("Course", back_populates="discussions")
    lesson = relationship("Lesson", back_populates="discussions")

    comments = relationship(
        "Comment",
        back_populates="discussion",
        cascade="all, delete-orphan",
        order_by="Comment.created_at"
    )