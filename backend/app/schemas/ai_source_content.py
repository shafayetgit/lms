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


class AIGenerationStatusResponse(BaseSchema):
    public_id: str
    status: str
    error_message: str | None = None
    celery_task_id: str | None = None
    draft_quiz_public_id: str | None = None
    created_at: datetime
