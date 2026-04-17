from sqlalchemy import Column, Integer, ForeignKey, DateTime, Boolean, String, Enum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, timezone
import enum
from typing import TYPE_CHECKING
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User, Student
    from app.models.course import Course

class EnrollmentStatus(str, enum.Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    PENDING = "pending"

class Enrollment(Base):
    """
    Enrollment model connecting students to courses.
    """
    __tablename__ = "enrollments"

    id: Mapped[int] = mapped_column(primary_key=True)
    
    # Foreign Keys
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    
    # Enrollment Details
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    status: Mapped[EnrollmentStatus] = mapped_column(String(20), default=EnrollmentStatus.ACTIVE)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="enrollments")
    course: Mapped["Course"] = relationship("Course", back_populates="enrollments")

    def __repr__(self) -> str:
        return f"<Enrollment(id={self.id}, user_id={self.user_id}, course_id={self.course_id}, status={self.status})>"