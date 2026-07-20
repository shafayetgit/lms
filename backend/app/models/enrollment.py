from sqlalchemy import Column, Integer, ForeignKey, DateTime, Boolean, String, Enum, Float
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, timezone
import enum
from typing import TYPE_CHECKING, Optional
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.course import Course
    from app.models.lesson import Lesson
    from app.models.batch import Batch
    from app.models.payment import Payment
    from app.models.certificate import Certificate

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

    # Foreign Keys
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    
    # Enrollment Details
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    status: Mapped[EnrollmentStatus] = mapped_column(String(20), default=EnrollmentStatus.ACTIVE)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    batch_id: Mapped[Optional[int]] = mapped_column(ForeignKey("batches.id", ondelete="SET NULL"), nullable=True)
    progress: Mapped[float] = mapped_column(Float, default=0.0)
    current_lesson_id: Mapped[Optional[int]] = mapped_column(ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True)
    
    purchased_certificate: Mapped[bool] = mapped_column(Boolean, default=False)
    certificate_id: Mapped[Optional[int]] = mapped_column(ForeignKey("certificates.id", ondelete="SET NULL"), nullable=True)
    payment_id: Mapped[Optional[int]] = mapped_column(ForeignKey("payments.id", ondelete="SET NULL"), nullable=True)
    enrollment_from_batch: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="enrollments")
    course: Mapped["Course"] = relationship("Course", back_populates="enrollments")
    batch: Mapped[Optional["Batch"]] = relationship("Batch")
    current_lesson: Mapped[Optional["Lesson"]] = relationship("Lesson")
    certificate: Mapped[Optional["Certificate"]] = relationship("Certificate")
    payment: Mapped[Optional["Payment"]] = relationship("Payment")

    def __repr__(self) -> str:
        return f"<Enrollment(id={self.id}, user_id={self.user_id}, course_id={self.course_id}, status={self.status})>"