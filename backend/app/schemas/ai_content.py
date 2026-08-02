from datetime import datetime
from typing import Any

from app.core.base import BaseSchema


class AISourceContentResponse(BaseSchema):
    public_id: str
    title: str
    original_filename: str
    corrected_text: str
    meta_info: dict[str, Any] | None = None
    created_at: datetime


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


class AIGenerationStatusResponse(BaseSchema):
    public_id: str
    status: str
    error_message: str | None = None
    celery_task_id: str | None = None
    draft_quiz_public_id: str | None = None
    created_at: datetime
