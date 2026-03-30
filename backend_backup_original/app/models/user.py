from typing import Optional

from sqlalchemy import DateTime, String, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from datetime import datetime, timezone, date
import enum

from app.db.base import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    INSTRUCTOR = "instructor"
    STUDENT = "student"
    USER = "user"


class User(Base):
    """
    Base User model using Joined Table Inheritance (Polymorphic pattern).
    
    All users (ADMIN, INSTRUCTOR, STUDENT) share these core fields.
    Role-specific fields are in Student and Instructor child tables.
    """
    __tablename__ = "users"

    # Core identity
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    email: Mapped[str] = mapped_column(String(100), unique=True)
    first_name: Mapped[str] = mapped_column(String(50))
    last_name: Mapped[str] = mapped_column(String(50))
    hashed_password: Mapped[str]
    
    # Account Status
    role: Mapped[UserRole] = mapped_column(String(20), default=UserRole.STUDENT)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Preferences
    preferred_language: Mapped[str] = mapped_column(String(10), default="en")
    timezone: Mapped[str] = mapped_column(String(50), default="UTC")
    
    # Security - Password
    last_password_change: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Security - 2FA
    two_factor_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    two_factor_method: Mapped[Optional[str]] = mapped_column(String(20))  # 'email', 'sms', 'totp'
    totp_secret: Mapped[Optional[str]] = mapped_column(String(255))  # Encrypted TOTP secret
    backup_codes: Mapped[Optional[str]] = mapped_column(String(500))  # Encrypted JSON array
    phone_number: Mapped[Optional[str]] = mapped_column(String(20))
    
    # Security - Login Management
    login_attempts: Mapped[int] = mapped_column(default=0)
    last_failed_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    is_locked: Mapped[bool] = mapped_column(Boolean, default=False)
    locked_until: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # OAuth2 Integration - Relationship to OAuth accounts
    oauth_accounts: Mapped[list["OAuthAccount"]] = relationship(
        "OAuthAccount",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    
    # Discriminator column for polymorphic queries
    type: Mapped[str] = mapped_column(String(20), default="user")
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=True,
    )
    
    last_login: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    __mapper_args__ = {
        "polymorphic_identity": "user",
        "polymorphic_on": type,
    }


class Student(User):
    """
    Student user with student-specific fields.
    Inherits all base User fields via foreign key relationship.
    """
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    
    # Student-specific fields (phone_number inherited from User)
    student_id: Mapped[str] = mapped_column(String(50), unique=True)
    enrollment_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    date_of_birth: Mapped[Optional[date]]
    department: Mapped[Optional[str]] = mapped_column(String(100))
    profile_picture_url: Mapped[Optional[str]]

    __mapper_args__ = {
        "polymorphic_identity": "student",
    }


class Instructor(User):
    """
    Instructor user with instructor-specific fields.
    Inherits all base User fields via foreign key relationship.
    """
    __tablename__ = "instructors"

    id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    
    # Instructor-specific fields
    qualification: Mapped[str] = mapped_column(String(200))
    specialization: Mapped[Optional[str]] = mapped_column(String(200))
    bio: Mapped[Optional[str]] = mapped_column(String(500))
    department: Mapped[Optional[str]] = mapped_column(String(100))
    profile_picture_url: Mapped[Optional[str]]

    __mapper_args__ = {
        "polymorphic_identity": "instructor",
    }


class OAuthAccount(Base):
    """
    OAuth2 account linked to a user.
    
    Supports multiple OAuth providers per user (Google, GitHub, Facebook, etc.)
    Normalized design allows scalability without schema changes.
    """
    __tablename__ = "oauth_accounts"

    # Primary key
    id: Mapped[int] = mapped_column(primary_key=True)
    
    # Foreign key to user
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    
    # Provider information
    provider: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="OAuth provider: 'google', 'github', 'facebook', 'linkedin', etc.",
    )
    provider_user_id: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="User ID from the OAuth provider",
    )
    provider_email: Mapped[Optional[str]] = mapped_column(
        String(100),
        comment="Email from OAuth provider",
    )
    
    # Profile data from provider (stored as JSON string)
    profile_data: Mapped[Optional[str]] = mapped_column(
        String(2000),
        comment="JSON: name, picture, bio, location, etc. from provider",
    )
    
    # Tracking
    linked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    last_used_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        comment="Last time this OAuth account was used for login",
    )
    
    # Relationship back to user
    user: Mapped["User"] = relationship(
        "User",
        back_populates="oauth_accounts",
    )
    
    # Unique constraints
    __table_args__ = (
        # One provider per user (can't link Google twice)
        UniqueConstraint("user_id", "provider", name="uq_user_oauth_provider"),
        # Provider IDs must be unique globally (can't reuse same Google ID)
        UniqueConstraint("provider", "provider_user_id", name="uq_provider_user_id"),
    )

