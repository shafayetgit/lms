import enum
from datetime import date, time
from typing import Optional, TYPE_CHECKING
from sqlalchemy import (
    Boolean,
    Enum as SQLEnum,
    ForeignKey,
    String,
    Text,
    Integer,
    Date,
    Time,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.course import Course
    from app.models.batch import Batch
    from app.models.user import User

class LiveClassStatus(str, enum.Enum):
    SCHEDULED = "Scheduled"
    LIVE = "Live"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class LiveClass(Base):
    __tablename__ = "live_classes"

    title: Mapped[str] = mapped_column(String(150), index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    batch_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("batches.id", ondelete="CASCADE"), nullable=True
    )
    course_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), nullable=True
    )
    host_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    date: Mapped[date] = mapped_column(Date)
    time: Mapped[time] = mapped_column(Time)
    duration: Mapped[int] = mapped_column(Integer) # duration in minutes
    timezone: Mapped[str] = mapped_column(String(50), default="UTC")
    meeting_link: Mapped[str] = mapped_column(String(255))
    password: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    auto_recording: Mapped[bool] = mapped_column(Boolean, default=False)
    recording_link: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[LiveClassStatus] = mapped_column(
        SQLEnum(
            LiveClassStatus,
            name="live_class_status_enum",
            values_callable=lambda x: [e.value for e in x],
        ),
        default=LiveClassStatus.SCHEDULED,
    )

    # Relationships
    batch: Mapped[Optional["Batch"]] = relationship("Batch", back_populates="live_classes")
    course: Mapped[Optional["Course"]] = relationship("Course", back_populates="live_classes")
    host: Mapped["User"] = relationship("User", foreign_keys=[host_id], back_populates="hosted_classes")
