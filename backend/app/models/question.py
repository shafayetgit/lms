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
        # maintain order uniqueness inside quiz (if quiz_id is set)
        # Note: If quiz_id is None, this might not work as expected in some DBs for uniqueness, 
        # but usually questions in bank don't have order.
        Index("idx_question_quiz", "quiz_id"),
        Index("idx_question_type", "question_type"),
        Index("idx_question_course", "course_id"),
        Index("idx_question_category", "category_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    # 🔗 relations
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

    # 🧠 content
    text: Mapped[str] = mapped_column(Text) # Renamed to 'text' for simpler queries or keeping 'question_text'? 
    # Migration uses 'text'. I'll stick to 'text' to avoid unnecessary renames if possible, 
    # but the draft had 'question_text'. I'll use 'text' as it is already in the DB.

    explanation: Mapped[Optional[str]] = mapped_column(Text)
    # shown after answering

    # ⚙️ config
    question_type: Mapped[QuestionType] = mapped_column(
        SQLEnum(QuestionType, name="question_type_enum"),
        default=QuestionType.MCQ_SINGLE,
        index=True
    )

    points: Mapped[float] = mapped_column(Float, default=1.0) # Renamed from 'marks' in draft to 'points' to match migration

    order_index: Mapped[int] = mapped_column(Integer, default=0) # Renamed from 'order' to 'order_index' to match migration

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


    # 🔗 relationships
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

    # 🔗 relationships
    question = relationship("Question", back_populates="choices")