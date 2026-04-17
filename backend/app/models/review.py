from datetime import datetime
from typing import Optional

from sqlalchemy import (
    ForeignKey,
    Text,
    CheckConstraint,
    UniqueConstraint,
    DateTime,
    func,
    Boolean,
    SmallInteger,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Review(Base):
    __tablename__ = "reviews"

    __table_args__ = (
        # rating constraint (1–5)
        CheckConstraint("rating >= 1 AND rating <= 5", name="ck_review_rating"),

        # one review per student per course
        UniqueConstraint("course_id", "student_id", name="uq_course_student_review"),

        # composite index for common query pattern
        Index("idx_reviews_course_active_created", "course_id", "is_active", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    # Foreign keys (indexed)
    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"),
        index=True
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True
    )

    # Rating (1–5)
    rating: Mapped[int] = mapped_column(SmallInteger)

    # Review text
    body: Mapped[Optional[str]] = mapped_column(Text)

    # Moderation flag
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        index=True
    )

    # Relationships
    course = relationship("Course", back_populates="reviews")
    student = relationship("User", back_populates="reviews")