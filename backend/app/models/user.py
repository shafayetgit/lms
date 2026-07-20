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
    from app.models.course_progress import CourseProgress
    from app.models.discussion import Discussion
    from app.models.comment import Comment
    from app.models.enrollment import Enrollment
    from app.models.role_profile import RoleProfile
    from app.models.feature_flag import FeatureFlag

from app.models.role import Role, UserRoleAssociation


# ---------------- BASE USER ---------------- #


class User(Base):

    __tablename__ = "users"

    # Indexes
    __table_args__ = (
        Index("idx_users_email", "email"),
        Index("idx_users_username", "username"),
    )

    # Core identity
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)

    email: Mapped[str] = mapped_column(String(100), unique=True, index=True)

    first_name: Mapped[str] = mapped_column(String(50))
    last_name: Mapped[str] = mapped_column(String(50))
    
    bio: Mapped[Optional[str]] = mapped_column(String(500))
    headline: Mapped[Optional[str]] = mapped_column(String(200))
    open_to: Mapped[Optional[str]] = mapped_column(String(50))
    country: Mapped[Optional[str]] = mapped_column(String(100))
    date_of_birth: Mapped[Optional[date]]
    
    hashed_password: Mapped[str] = mapped_column(String(255))

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
    avatar: Mapped[Optional[str]] = mapped_column(String(255))

    # Security - Sign In
    sign_in_attempts: Mapped[int] = mapped_column(default=0, nullable=False)

    last_failed_sign_in: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True)
    )

    is_locked: Mapped[bool] = mapped_column(Boolean, default=False)

    locked_until: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    last_sign_in: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Unified instructor-specific fields
    qualification: Mapped[Optional[str]] = mapped_column(String(200))
    specialization: Mapped[Optional[str]] = mapped_column(String(200))

    # Relationships
    roles: Mapped[List["Role"]] = relationship(
        "Role", secondary="user_roles", back_populates="users"
    )
    role_profiles: Mapped[List["RoleProfile"]] = relationship(
        "RoleProfile", secondary="user_role_profiles", back_populates="users"
    )
    feature_flags: Mapped[List["FeatureFlag"]] = relationship(
        "FeatureFlag", secondary="user_feature_flags", back_populates="users"
    )

    courses: Mapped[List["Course"]] = relationship(
        "Course", secondary="course_instructors", back_populates="instructors"
    )

    reviews: Mapped[List["Review"]] = relationship(
        "Review", back_populates="student", cascade="all, delete-orphan"
    )

    wishlist_items: Mapped[List["Wishlist"]] = relationship(
        "Wishlist", back_populates="user", cascade="all, delete-orphan"
    )

    course_progress: Mapped[List["CourseProgress"]] = relationship(
        "CourseProgress", back_populates="user", cascade="all, delete-orphan"
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

    batch_enrollments = relationship(
        "BatchEnrollment", back_populates="member", cascade="all, delete-orphan"
    )
    batch_feedbacks = relationship(
        "BatchFeedback", back_populates="member", cascade="all, delete-orphan"
    )
    evaluated_batch_courses = relationship(
        "BatchCourse", back_populates="evaluator"
    )
    program_memberships = relationship(
        "ProgramMember", back_populates="member", cascade="all, delete-orphan"
    )
    assignment_submissions = relationship(
        "AssignmentSubmission", back_populates="member", cascade="all, delete-orphan"
    )
    certificates = relationship(
        "Certificate", foreign_keys="[Certificate.member_id]", back_populates="member", cascade="all, delete-orphan"
    )
    certificate_evaluations_received = relationship(
        "CertificateEvaluation", foreign_keys="[CertificateEvaluation.member_id]", back_populates="member", cascade="all, delete-orphan"
    )
    certificate_evaluations_given = relationship(
        "CertificateEvaluation", foreign_keys="[CertificateEvaluation.evaluator_id]", back_populates="evaluator"
    )
    certificate_requests = relationship(
        "CertificateRequest", foreign_keys="[CertificateRequest.member_id]", back_populates="member", cascade="all, delete-orphan"
    )
    payments = relationship(
        "Payment", back_populates="member", cascade="all, delete-orphan"
    )
    badges = relationship(
        "BadgeAssignment", foreign_keys="[BadgeAssignment.member_id]", back_populates="member", cascade="all, delete-orphan"
    )
    badges_assigned = relationship(
        "BadgeAssignment", foreign_keys="[BadgeAssignment.assigned_by_id]", back_populates="assigned_by"
    )
    hosted_classes = relationship(
        "LiveClass", foreign_keys="[LiveClass.host_id]", back_populates="host"
    )
    lesson_notes = relationship("LessonNote", back_populates="member", cascade="all, delete-orphan")
    watch_durations = relationship("VideoWatchDuration", back_populates="member", cascade="all, delete-orphan")

    @property
    def full_name(self) -> str:
        name = f"{self.first_name or ''} {self.last_name or ''}".strip()
        return name if name else self.username

    @property
    def role(self) -> str:
        role_val = None
        if "roles" in self.__dict__ and self.roles:
            role_val = self.roles[0].slug or self.roles[0].name
        elif "role_profiles" in self.__dict__ and self.role_profiles:
            for profile in self.role_profiles:
                if profile.roles:
                    role_val = profile.roles[0].slug or profile.roles[0].name
                    break
        if not role_val:
            role_val = getattr(self, "_role_str", "student")
        
        return role_val.lower().replace(" ", "").replace("-", "")

    @property
    def all_roles(self) -> List["Role"]:
        res = list(self.roles) if "roles" in self.__dict__ else []
        if "role_profiles" in self.__dict__:
            for profile in self.role_profiles:
                for r in profile.roles:
                    if r not in res:
                        res.append(r)
        return res

    @role.setter
    def role(self, value):
        if not value:
            return
        role_name = value.value if hasattr(value, "value") else value
        self._role_str = role_name

