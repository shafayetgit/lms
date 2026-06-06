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
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class CourseBadge(str, Enum):
    NONE = "none"
    FEATURED = "featured"


class CourseLanguage(str, Enum):
    EN = "en"
    BN = "bn"


# ---------------- MODEL ---------------- #


class Course(Base):
    __tablename__ = "courses"

    __table_args__ = (
        Index(
            "idx_courses_badge_active_created",
            "badge",
            "is_active",
            "created_at",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    instructor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    category_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("categories.id"), index=True
    )

    title: Mapped[str] = mapped_column(String(200))

    slug: Mapped[str] = mapped_column(
        String(220),
        unique=True,
        index=True,
    )

    description: Mapped[Optional[str]] = mapped_column(Text)
    thumbnail: Mapped[Optional[str]] = mapped_column(Text)

    level: Mapped[CourseLevel] = mapped_column(
        SQLEnum(
            CourseLevel,
            name="course_level_enum",
            values_callable=lambda x: [e.value for e in x],
        ),
        default=CourseLevel.BEGINNER,
    )

    language: Mapped[CourseLanguage] = mapped_column(
        SQLEnum(
            CourseLanguage,
            name="course_language_enum",
            values_callable=lambda x: [e.value for e in x],
        ),
        default=CourseLanguage.EN,
    )

    badge: Mapped[CourseBadge] = mapped_column(
        SQLEnum(
            CourseBadge,
            name="course_badge_enum",
            values_callable=lambda x: [e.value for e in x],
        ),
        default=CourseBadge.NONE,
        index=True,
    )

    price: Mapped[float] = mapped_column(Float, default=0.0)
    is_free: Mapped[bool] = mapped_column(Boolean, default=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

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
