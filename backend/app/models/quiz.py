from sqlalchemy import Column, Integer, ForeignKey, String, Text, Boolean, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import List, Optional, TYPE_CHECKING
import enum
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.course import Course
    from app.models.lesson import Lesson
    from app.models.question import Question

class Quiz(Base):
    """
    Quiz model for courses and lessons.
    """
    __tablename__ = "quizzes"

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    lesson_id: Mapped[Optional[int]] = mapped_column(ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True, index=True)

    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    time_limit: Mapped[Optional[int]] = mapped_column(Integer)  # in minutes
    passing_score: Mapped[float] = mapped_column(Float, default=70.0)  # percentage
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="quizzes")
    lesson: Mapped[Optional["Lesson"]] = relationship("Lesson", back_populates="quizzes")
    questions: Mapped[List["Question"]] = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")