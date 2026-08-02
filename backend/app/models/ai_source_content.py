from typing import TYPE_CHECKING

from sqlalchemy import JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.ai_quiz import AIDraftQuiz


class AISourceContent(Base):
    __tablename__ = "ai_source_contents"

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    corrected_text: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="queued", nullable=False
    )  # queued, parsing, correcting, generating, auditing, completed, failed
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    celery_task_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    meta_info: Mapped[dict | None] = mapped_column(
        JSON, nullable=True
    )  # confidence_score, corrections_made, etc.

    draft_quizzes: Mapped[list["AIDraftQuiz"]] = relationship(
        "AIDraftQuiz", back_populates="source_content", cascade="all, delete-orphan"
    )
