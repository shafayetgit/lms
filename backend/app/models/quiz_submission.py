import enum
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean, ForeignKey, DateTime, Float, Index, Enum, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.quiz import Quiz
    from app.models.question import Question, Choice

class AttemptStatus(str, enum.Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    TIMED_OUT = "timed_out"

class QuizSubmission(Base):
    __tablename__ = "quiz_submissions"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    quiz_id: Mapped[int] = mapped_column(ForeignKey("quizzes.id", ondelete="CASCADE"), index=True)
    
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    score: Mapped[float] = mapped_column(Float, default=0.0)
    score_out_of: Mapped[float] = mapped_column(Float, default=0.0)
    percentage: Mapped[float] = mapped_column(Float, default=0.0)
    passing: Mapped[bool] = mapped_column(Boolean, default=False)
    time_taken: Mapped[int] = mapped_column(Integer, default=0)  # seconds
    
    status: Mapped[AttemptStatus] = mapped_column(
        Enum(AttemptStatus, name="submission_status_enum"), 
        default=AttemptStatus.IN_PROGRESS,
        nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", backref="quiz_submissions")
    quiz: Mapped["Quiz"] = relationship("Quiz", backref="attempts")
    answers: Mapped[List["QuizResult"]] = relationship(
        "QuizResult", back_populates="submission", cascade="all, delete-orphan", lazy="selectin"
    )

    __table_args__ = (
        Index("idx_submission_user_quiz", "user_id", "quiz_id"),
    )

class QuizResult(Base):
    __tablename__ = "quiz_results"

    submission_id: Mapped[int] = mapped_column(ForeignKey("quiz_submissions.id", ondelete="CASCADE"), index=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), index=True)
    selected_option_id: Mapped[int] = mapped_column(ForeignKey("choices.id", ondelete="SET NULL"), nullable=True)
    
    answer_text: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    marks: Mapped[float] = mapped_column(Float, default=0.0)

    # Relationships
    submission: Mapped["QuizSubmission"] = relationship("QuizSubmission", back_populates="answers")
    question: Mapped["Question"] = relationship("Question")
    choice: Mapped[Optional["Choice"]] = relationship("Choice")