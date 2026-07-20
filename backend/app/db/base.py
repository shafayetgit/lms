from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import DateTime, BigInteger, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from uuid_utils import uuid7

from app.core.context import current_user_id

class Base(DeclarativeBase):
    """
    Base model: id (BIGINT) for internal FKs, public_id (UUIDv7) for API exposure.
    Auto-managed created_at and updated_at timestamps.
    """

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    public_id: Mapped[str] = mapped_column(
        String(36),
        default=lambda: str(uuid7()),
        unique=True,
        index=True,
        nullable=False,
    )

    owner_id: Mapped[Optional[int]] = mapped_column(
        default=lambda: current_user_id.get(),
        nullable=True,
        index=True,
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=True,
    )

from app.models.batch import Batch, BatchCourse, BatchEnrollment, BatchTimetable, BatchFeedback
from app.models.program import Program, ProgramCourse, ProgramMember
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.certificate import Certificate, CertificateEvaluation, CertificateRequest
from app.models.payment import Coupon, Payment
from app.models.payment_gateway import PaymentGatewayConfig
from app.models.badge import Badge, BadgeAssignment
from app.models.live_class import LiveClass
from app.models.settings import LMSSettings
from app.models.tracking import LessonNote, VideoWatchDuration, CourseInterest, RelatedCourse
from app.models.invitation import Invitation
from app.models.email_account import EmailAccount
from app.models.email_template import EmailTemplate
from app.models.notification import Notification