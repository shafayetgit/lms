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
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Chapter(Base):
    __tablename__ = "chapters"

    __table_args__ = (
        UniqueConstraint("course_id", "order_index", name="uq_course_chapter_order"),
        Index("idx_chapters_course_id", "course_id"),
        Index("idx_chapters_course_order", "course_id", "order_index"),
    )

    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), index=True
    )

    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text)

    order_index: Mapped[int] = mapped_column(default=0)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    is_scorm_package: Mapped[bool] = mapped_column(Boolean, default=False)


    course = relationship("Course", back_populates="chapters")
    lessons = relationship(
        "Lesson",
        back_populates="chapter",
        cascade="all, delete-orphan",
        order_by="Lesson.order_index",
    )

