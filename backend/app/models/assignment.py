from datetime import datetime, timezone
import enum
from typing import Optional, TYPE_CHECKING
from sqlalchemy import (
    Boolean,
    Enum as SQLEnum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.course import Course
    from app.models.user import User

class AssignmentType(str, enum.Enum):
    DOCUMENT = "Document"
    PDF = "PDF"
    URL = "URL"
    IMAGE = "Image"
    TEXT = "Text"

class SubmissionStatus(str, enum.Enum):
    PENDING = "Pending"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"

class Assignment(Base):
    __tablename__ = "assignments"

    title: Mapped[str] = mapped_column(String(200), index=True)
    type: Mapped[AssignmentType] = mapped_column(
        SQLEnum(
            AssignmentType,
            name="assignment_type_enum",
            values_callable=lambda x: [e.value for e in x],
        )
    )
    question: Mapped[str] = mapped_column(Text)
    course_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), nullable=True
    )
    show_answer: Mapped[bool] = mapped_column(Boolean, default=False)
    answer: Mapped[Optional[str]] = mapped_column(Text)
    grade_assignment: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    course: Mapped[Optional["Course"]] = relationship(
        "Course", back_populates="assignments"
    )
    submissions: Mapped[list["AssignmentSubmission"]] = relationship(
        "AssignmentSubmission", back_populates="assignment", cascade="all, delete-orphan"
    )


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    assignment_id: Mapped[int] = mapped_column(
        ForeignKey("assignments.id", ondelete="CASCADE")
    )
    member_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    answer: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[SubmissionStatus] = mapped_column(
        SQLEnum(
            SubmissionStatus,
            name="assignment_submission_status_enum",
            values_callable=lambda x: [e.value for e in x],
        ),
        default=SubmissionStatus.PENDING,
    )
    grade: Mapped[Optional[float]] = mapped_column(Float)
    comments: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    assignment: Mapped["Assignment"] = relationship(
        "Assignment", back_populates="submissions"
    )
    member: Mapped["User"] = relationship(
        "User", back_populates="assignment_submissions"
    )
