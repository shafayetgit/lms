from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
import enum

from sqlalchemy import (
    ForeignKey,
    String,
    Text,
    Integer,
    Float,
    Boolean,
    DateTime,
    Enum as SQLEnum,
    Index,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.quiz import Quiz
    from app.models.course import Course
    from app.models.category import Category
    from app.models.user import User


# ---------------- ENUM ---------------- #

class QuestionType(str, enum.Enum):
    MCQ_SINGLE = "mcq_single"
    MCQ_MULTIPLE = "mcq_multiple"
    TRUE_FALSE = "true_false"
    SHORT_ANSWER = "short_answer"


# ---------------- MODELS ---------------- #

class Question(Base):
    __tablename__ = "questions"

    __table_args__ = (
        Index("idx_question_quiz", "quiz_id"),
        Index("idx_question_type", "question_type"),
        Index("idx_question_course", "course_id"),
        Index("idx_question_category", "category_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    quiz_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("quizzes.id", ondelete="CASCADE"),
        index=True,
        nullable=True
    )
    
    course_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("courses.id", ondelete="SET NULL"),
        index=True,
        nullable=True
    )

    category_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("categories.id", ondelete="SET NULL"),
        index=True,
        nullable=True
    )

    created_by_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        index=True
    )


    text: Mapped[str] = mapped_column(Text)
    explanation: Mapped[Optional[str]] = mapped_column(Text)

    question_type: Mapped[QuestionType] = mapped_column(
        SQLEnum(QuestionType, name="question_type_enum"),
        default=QuestionType.MCQ_SINGLE,
        index=True
    )

    points: Mapped[float] = mapped_column(Float, default=1.0) 

    order_index: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


    quiz = relationship("Quiz", back_populates="questions")
    course = relationship("Course")
    category = relationship("Category")
    created_by = relationship("User")

    choices: Mapped[List["Choice"]] = relationship(
        "Choice",
        back_populates="question",
        cascade="all, delete-orphan",
        lazy="selectin"
    )


class Choice(Base):
    __tablename__ = "choices"

    id: Mapped[int] = mapped_column(primary_key=True)

    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE"),
        index=True
    )

    text: Mapped[str] = mapped_column(Text)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    
    explanation: Mapped[Optional[str]] = mapped_column(Text)

    question = relationship("Question", back_populates="choices")