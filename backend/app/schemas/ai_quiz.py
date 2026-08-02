from datetime import datetime
from typing import Any

from app.core.base import BaseSchema


class AIDraftQuizResponse(BaseSchema):
    public_id: str
    source_content_public_id: str
    difficulty: str
    num_questions: int
    quiz_data: dict[str, Any]  # Matches QuizOutput structure
    quality_report: dict[str, Any]  # Matches QualityReport structure
    status: str
    confirmed_quiz_public_id: str | None = None
    created_at: datetime


class AIDraftQuizUpdateRequest(BaseSchema):
    quiz_data: dict[str, Any]  # Updated quiz questions/options/answers


class AIQuizConfirmationRequest(BaseSchema):
    title_override: str | None = None
    description_override: str | None = None
