from datetime import datetime
from operator import index
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
    from app.models.chapter import Chapter
    from app.models.course_progress import CourseProgress
    from app.models.discussion import Discussion
    from app.models.quiz import Quiz
    from app.models.user import User
    from app.models.review import Review
    from app.models.wishlist import Wishlist
    from app.models.enrollment import Enrollment


# ---------------- MODEL ---------------- #

class Course(Base):
    __tablename__ = "courses"

    __table_args__ = (
        Index(
            "idx_courses_published_created",
            "published",
            "created_at",
        ),
    )

    category_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("categories.id"), index=True
    )

    title: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    short_introduction: Mapped[Optional[str]] = mapped_column(Text)
    overview: Mapped[Optional[str]] = mapped_column(Text)
    thumbnail: Mapped[Optional[str]] = mapped_column(Text)
    video: Mapped[Optional[str]] = mapped_column(String(255))
    tags: Mapped[Optional[str]] = mapped_column(String(255))
    meta_description: Mapped[Optional[str]] = mapped_column(Text)
    meta_keywords: Mapped[Optional[str]] = mapped_column(Text)

    published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    upcoming: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    featured: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    disable_self_learning: Mapped[bool] = mapped_column(Boolean, default=False)

    paid_course: Mapped[bool] = mapped_column(Boolean, default=False)
    paid_certificate: Mapped[bool] = mapped_column(Boolean, default=False)
    course_price: Mapped[float] = mapped_column(Float, default=0.0)
    currency: Mapped[Optional[str]] = mapped_column(String(10))

    enable_certification: Mapped[bool] = mapped_column(Boolean, default=False)
    card_gradient: Mapped[Optional[str]] = mapped_column(String(50))

    rating: Mapped[float] = mapped_column(Float, default=0.0)
    total_enrollments: Mapped[int] = mapped_column(default=0)
    total_lessons: Mapped[int] = mapped_column(default=0)

    @property
    def avg_rating(self) -> float:
        if hasattr(self, "_avg_rating"):
            return self._avg_rating
        return self.rating

    @avg_rating.setter
    def avg_rating(self, value: float):
        self._avg_rating = value

    @property
    def total_reviews(self) -> int:
        if hasattr(self, "_total_reviews"):
            return self._total_reviews
        try:
            return len(self.reviews)
        except Exception:
            return 0

    @total_reviews.setter
    def total_reviews(self, value: int):
        self._total_reviews = value

    # Relationships
    category = relationship("Category", back_populates="courses")
    
    @property
    def category_public_id(self) -> Optional[str]:
        return self.category.public_id if self.category else None

    reviews = relationship("Review", back_populates="course")
    wishlisted_by = relationship(
        "Wishlist", back_populates="course", cascade="all, delete-orphan"
    )
    chapters = relationship(
        "Chapter",
        back_populates="course",
        cascade="all, delete-orphan",
        order_by="Chapter.order_index",
    )
    discussions = relationship(
        "Discussion", back_populates="course", cascade="all, delete-orphan"
    )
    enrollments: Mapped[List["Enrollment"]] = relationship(
        "Enrollment", back_populates="course", cascade="all, delete-orphan"
    )

    instructors: Mapped[List["User"]] = relationship(
        "User", secondary="course_instructors", back_populates="courses"
    )
    batches = relationship(
        "BatchCourse", back_populates="course", cascade="all, delete-orphan"
    )
    programs = relationship(
        "ProgramCourse", back_populates="course", cascade="all, delete-orphan"
    )
    assignments = relationship(
        "Assignment", back_populates="course", cascade="all, delete-orphan"
    )
    certificates = relationship(
        "Certificate", back_populates="course", cascade="all, delete-orphan"
    )
    certificate_evaluations = relationship(
        "CertificateEvaluation", back_populates="course", cascade="all, delete-orphan"
    )
    certificate_requests = relationship(
        "CertificateRequest", back_populates="course", cascade="all, delete-orphan"
    )
    live_classes = relationship(
        "LiveClass", back_populates="course", cascade="all, delete-orphan"
    )
    interests = relationship("CourseInterest", back_populates="course", cascade="all, delete-orphan")
    related_courses = relationship("RelatedCourse", foreign_keys="[RelatedCourse.course_id]", back_populates="course", cascade="all, delete-orphan")
