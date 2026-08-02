from typing import TYPE_CHECKING

from sqlalchemy import JSON, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.quiz import Quiz

if TYPE_CHECKING:
    from app.models.ai_source_content import AISourceContent


class AIDraftQuiz(Base):
    __tablename__ = "ai_draft_quizzes"

    source_content_id: Mapped[int] = mapped_column(
        ForeignKey("ai_source_contents.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    difficulty: Mapped[str] = mapped_column(String(50), nullable=False)
    num_questions: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    quiz_data: Mapped[dict] = mapped_column(
        JSON, nullable=False
    )  # stores QuizOutput structure
    quality_report: Mapped[dict] = mapped_column(
        JSON, nullable=False
    )  # stores QualityReport structure
    status: Mapped[str] = mapped_column(
        String(50), default="pending_review", nullable=False
    )  # pending_review, confirmed, rejected

    confirmed_quiz_id: Mapped[int | None] = mapped_column(
        ForeignKey("quizzes.id", ondelete="SET NULL"), index=True, nullable=True
    )

    source_content: Mapped["AISourceContent"] = relationship(
        "AISourceContent", back_populates="draft_quizzes"
    )
    confirmed_quiz: Mapped[Quiz | None] = relationship("Quiz")

    @property
    def source_content_public_id(self) -> str:
        return self.source_content.public_id if self.source_content else ""

    @property
    def confirmed_quiz_public_id(self) -> str | None:
        return self.confirmed_quiz.public_id if self.confirmed_quiz else None
