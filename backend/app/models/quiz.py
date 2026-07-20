from sqlalchemy import Integer, String, Text, Boolean, Float
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import List, Optional, TYPE_CHECKING
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.question import Question


class Quiz(Base):
    """
    Quiz model for courses and lessons.
    """
    __tablename__ = "quizzes"

    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    max_attempts: Mapped[int] = mapped_column(Integer, default=1)
    show_answers: Mapped[bool] = mapped_column(Boolean, default=False)
    show_submission_history: Mapped[bool] = mapped_column(Boolean, default=False)
    
    total_marks: Mapped[float] = mapped_column(Float, default=0.0)
    passing_percentage: Mapped[float] = mapped_column(Float, default=0.0)  # percentage
    
    duration: Mapped[int] = mapped_column(Integer, default=0)  # in minutes
    
    shuffle_questions: Mapped[bool] = mapped_column(Boolean, default=False)
    limit_questions_to: Mapped[int] = mapped_column(Integer, default=0)
    
    enable_negative_marking: Mapped[bool] = mapped_column(Boolean, default=False)
    marks_to_cut: Mapped[float] = mapped_column(Float, default=0.0)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    questions: Mapped[List["Question"]] = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")