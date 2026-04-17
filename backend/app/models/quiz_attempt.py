import enum
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean, ForeignKey, DateTime, Float, Index, Enum
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

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    quiz_id: Mapped[int] = mapped_column(ForeignKey("quizzes.id", ondelete="CASCADE"), index=True)
    
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    score: Mapped[float] = mapped_column(Float, default=0.0)
    total_points: Mapped[float] = mapped_column(Float, default=0.0)
    percentage: Mapped[float] = mapped_column(Float, default=0.0)
    is_passed: Mapped[bool] = mapped_column(Boolean, default=False)
    
    status: Mapped[AttemptStatus] = mapped_column(
        Enum(AttemptStatus, name="attempt_status_enum"), 
        default=AttemptStatus.IN_PROGRESS,
        nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", backref="quiz_attempts")
    quiz: Mapped["Quiz"] = relationship("Quiz", backref="attempts")
    answers: Mapped[List["QuizAttemptAnswer"]] = relationship(
        "QuizAttemptAnswer", back_populates="attempt", cascade="all, delete-orphan", lazy="selectin"
    )

    __table_args__ = (
        Index("idx_attempt_user_quiz", "user_id", "quiz_id"),
    )

class QuizAttemptAnswer(Base):
    __tablename__ = "quiz_attempt_answers"

    id: Mapped[int] = mapped_column(primary_key=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("quiz_attempts.id", ondelete="CASCADE"), index=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), index=True)
    choice_id: Mapped[int] = mapped_column(ForeignKey("choices.id", ondelete="SET NULL"), nullable=True)
    
    answer_text: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    points_earned: Mapped[float] = mapped_column(Float, default=0.0)

    # Relationships
    attempt: Mapped["QuizAttempt"] = relationship("QuizAttempt", back_populates="answers")
    question: Mapped["Question"] = relationship("Question")
    choice: Mapped[Optional["Choice"]] = relationship("Choice")