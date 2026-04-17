from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone, date
import enum

from sqlalchemy import (
    DateTime,
    String,
    Boolean,
    ForeignKey,
    Index,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


if TYPE_CHECKING:
    from app.models.course import Course
    from app.models.review import Review
    from app.models.wishlist import Wishlist
    from app.models.lesson_progress import LessonProgress
    from app.models.discussion import Discussion
    from app.models.comment import Comment
    from app.models.enrollment import Enrollment


# ---------------- ENUM ---------------- #


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    INSTRUCTOR = "instructor"
    STUDENT = "student"
    USER = "user"


# ---------------- BASE USER ---------------- #


class User(Base):
    """
    Base User model using Joined Table Inheritance (Polymorphic pattern).
    """

    __tablename__ = "users"

    __mapper_args__ = {
        "polymorphic_identity": "user",
        "polymorphic_on": "type",
    }

    # Indexes
    __table_args__ = (
        Index("idx_users_email", "email"),
        Index("idx_users_username", "username"),
        Index("idx_users_type", "type"),
    )

    # Core identity
    id: Mapped[int] = mapped_column(primary_key=True)

    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)

    email: Mapped[str] = mapped_column(String(100), unique=True, index=True)

    first_name: Mapped[str] = mapped_column(String(50))
    last_name: Mapped[str] = mapped_column(String(50))

    hashed_password: Mapped[str] = mapped_column(String(255))

    # Account Status
    role: Mapped[UserRole] = mapped_column(String(20), default=UserRole.STUDENT)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    # Preferences
    preferred_language: Mapped[str] = mapped_column(String(10), default="en")

    timezone: Mapped[str] = mapped_column(String(50), default="UTC")

    # Security - Password
    last_password_change: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True)
    )

    # Security - 2FA
    two_factor_enabled: Mapped[bool] = mapped_column(Boolean, default=False)

    two_factor_method: Mapped[Optional[str]] = mapped_column(String(20))
    totp_secret: Mapped[Optional[str]] = mapped_column(String(255))
    backup_codes: Mapped[Optional[str]] = mapped_column(String(500))

    phone_number: Mapped[Optional[str]] = mapped_column(String(20))

    # Security - Sign In
    sign_in_attempts: Mapped[int] = mapped_column(default=0, nullable=False)

    last_failed_sign_in: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True)
    )

    is_locked: Mapped[bool] = mapped_column(Boolean, default=False)

    locked_until: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Discriminator
    type: Mapped[str] = mapped_column(String(20), default="user", index=True)

    last_sign_in: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships (common for ALL users to avoid polymorphic mapper issues)
    courses: Mapped[List["Course"]] = relationship(
        "Course", back_populates="instructor", cascade="all, delete-orphan"
    )

    reviews: Mapped[List["Review"]] = relationship(
        "Review", back_populates="student", cascade="all, delete-orphan"
    )

    wishlist_items: Mapped[List["Wishlist"]] = relationship(
        "Wishlist", back_populates="user", cascade="all, delete-orphan"
    )

    lesson_progress: Mapped[List["LessonProgress"]] = relationship(
        "LessonProgress", back_populates="user", cascade="all, delete-orphan"
    )

    discussions: Mapped[List["Discussion"]] = relationship(
        "Discussion", back_populates="user", cascade="all, delete-orphan"
    )

    comments: Mapped[List["Comment"]] = relationship(
        "Comment", back_populates="user", cascade="all, delete-orphan"
    )

    enrollments: Mapped[List["Enrollment"]] = relationship(
        "Enrollment", back_populates="user", cascade="all, delete-orphan"
    )


# ---------------- STUDENT ---------------- #


class Student(User):
    """
    Student-specific model
    """

    __tablename__ = "students"

    __mapper_args__ = {
        "polymorphic_identity": "student",
    }

    id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )

    student_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)

    enrollment_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    date_of_birth: Mapped[Optional[date]]

    department: Mapped[Optional[str]] = mapped_column(String(100))

    profile_picture_url: Mapped[Optional[str]] = mapped_column(String(255))


# ---------------- INSTRUCTOR ---------------- #


class Instructor(User):
    """
    Instructor-specific model
    """

    __tablename__ = "instructors"

    __mapper_args__ = {
        "polymorphic_identity": "instructor",
    }

    id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )

    qualification: Mapped[str] = mapped_column(String(200))

    specialization: Mapped[Optional[str]] = mapped_column(String(200))

    bio: Mapped[Optional[str]] = mapped_column(String(500))

    department: Mapped[Optional[str]] = mapped_column(String(100))

    profile_picture_url: Mapped[Optional[str]] = mapped_column(String(255))
