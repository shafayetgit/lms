from datetime import date
import enum
from typing import Optional, TYPE_CHECKING
from sqlalchemy import (
    Boolean,
    Enum as SQLEnum,
    Float,
    ForeignKey,
    String,
    Text,
    Date,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.course import Course
    from app.models.user import User
    from app.models.batch import Batch

class EvaluationStatus(str, enum.Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    PASS = "Pass"
    FAIL = "Fail"

class RequestStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class Certificate(Base):
    __tablename__ = "certificates"

    member_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    course_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), nullable=True
    )
    batch_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("batches.id", ondelete="CASCADE"), nullable=True
    )
    issue_date: Mapped[date] = mapped_column(Date)
    expiry_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    published: Mapped[bool] = mapped_column(Boolean, default=False)
    template: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    member: Mapped["User"] = relationship("User", foreign_keys=[member_id], back_populates="certificates")
    course: Mapped[Optional["Course"]] = relationship("Course", back_populates="certificates")
    batch: Mapped[Optional["Batch"]] = relationship("Batch", back_populates="certificates")


class CertificateEvaluation(Base):
    __tablename__ = "certificate_evaluations"

    member_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    course_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), nullable=True
    )
    batch_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("batches.id", ondelete="CASCADE"), nullable=True
    )
    evaluator_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )
    date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    start_time: Mapped[Optional[str]] = mapped_column(String(10))
    end_time: Mapped[Optional[str]] = mapped_column(String(10))
    status: Mapped[EvaluationStatus] = mapped_column(
        SQLEnum(
            EvaluationStatus,
            name="evaluation_status_enum",
            values_callable=lambda x: [e.value for e in x],
        ),
        default=EvaluationStatus.PENDING,
    )
    rating: Mapped[Optional[float]] = mapped_column(Float)
    summary: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    member: Mapped["User"] = relationship("User", foreign_keys=[member_id], back_populates="certificate_evaluations_received")
    evaluator: Mapped[Optional["User"]] = relationship("User", foreign_keys=[evaluator_id], back_populates="certificate_evaluations_given")
    course: Mapped[Optional["Course"]] = relationship("Course", back_populates="certificate_evaluations")
    batch: Mapped[Optional["Batch"]] = relationship("Batch", back_populates="certificate_evaluations")


class CertificateRequest(Base):
    __tablename__ = "certificate_requests"

    member_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    course_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), nullable=True
    )
    batch_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("batches.id", ondelete="CASCADE"), nullable=True
    )
    evaluator_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )
    status: Mapped[RequestStatus] = mapped_column(
        SQLEnum(
            RequestStatus,
            name="request_status_enum",
            values_callable=lambda x: [e.value for e in x],
        ),
        default=RequestStatus.PENDING,
    )

    # Relationships
    member: Mapped["User"] = relationship("User", foreign_keys=[member_id], back_populates="certificate_requests")
    evaluator: Mapped[Optional["User"]] = relationship("User", foreign_keys=[evaluator_id])
    course: Mapped[Optional["Course"]] = relationship("Course", back_populates="certificate_requests")
    batch: Mapped[Optional["Batch"]] = relationship("Batch", back_populates="certificate_requests")
