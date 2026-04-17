from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from enum import Enum

from sqlalchemy import (
    ForeignKey,
    String,
    Text,
    DateTime,
    func,
    Float,
    Boolean,
    Enum as SQLEnum,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.module import Module
    from app.models.lesson_progress import LessonProgress
    from app.models.discussion import Discussion
    from app.models.quiz import Quiz
    from app.models.user import User
    from app.models.review import Review
    from app.models.wishlist import Wishlist
    from app.models.enrollment import Enrollment

# ---------------- ENUMS ---------------- #


class CourseLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class CourseStatus(str, Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


class CourseLanguage(str, Enum):
    en = "en"
    bn = "bn"


# ---------------- MODEL ---------------- #


class Course(Base):
    __tablename__ = "courses"

    __table_args__ = (
        # Composite index (VERY IMPORTANT for LMS queries)
        Index(
            "idx_courses_status_active_created",
            "status",
            "is_active",
            "created_at",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    # Foreign keys (indexed for joins)
    instructor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    category_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("categories.id"), index=True
    )

    # Core fields
    title: Mapped[str] = mapped_column(String(200))

    slug: Mapped[str] = mapped_column(
        String(220),
        unique=True,
        index=True,  # critical for URL lookup
    )

    description: Mapped[Optional[str]] = mapped_column(Text)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(Text)

    # Enums (named for Alembic safety)
    level: Mapped[CourseLevel] = mapped_column(
        SQLEnum(CourseLevel, name="course_level_enum"), default=CourseLevel.beginner
    )

    language: Mapped[CourseLanguage] = mapped_column(
        SQLEnum(CourseLanguage, name="course_language_enum"), default=CourseLanguage.en
    )

    status: Mapped[CourseStatus] = mapped_column(
        SQLEnum(CourseStatus, name="course_status_enum"),
        default=CourseStatus.draft,
        index=True,
    )

    # Pricing
    price: Mapped[float] = mapped_column(Float, default=0.0)
    is_free: Mapped[bool] = mapped_column(Boolean, default=False)

    # Control flags
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    # Course metadata
    duration: Mapped[Optional[int]] = mapped_column()  # minutes
    total_lessons: Mapped[int] = mapped_column(default=0)

    # Relationships
    instructor = relationship("User", back_populates="courses")
    category = relationship("Category", back_populates="courses")
    reviews = relationship("Review", back_populates="course")
    wishlisted_by = relationship(
        "Wishlist", back_populates="course", cascade="all, delete-orphan"
    )
    modules = relationship(
        "Module",
        back_populates="course",
        cascade="all, delete-orphan",
        order_by="Module.order_index",
    )
    discussions = relationship(
        "Discussion", back_populates="course", cascade="all, delete-orphan"
    )
    enrollments: Mapped[List["Enrollment"]] = relationship(
        "Enrollment", back_populates="course", cascade="all, delete-orphan"
    )
    quizzes: Mapped[List["Quiz"]] = relationship(
        "Quiz", back_populates="course", cascade="all, delete-orphan"
    )
