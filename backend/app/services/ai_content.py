from app.services.ai_quiz import AIQuizService, ai_quiz_service
from app.services.ai_source_content import (
    AISourceContentService,
    ai_source_content_service,
)

# Backwards compatibility alias
AIContentService = AIQuizService
ai_content_service = ai_quiz_service

__all__ = [
    "AIQuizService",
    "AISourceContentService",
    "AIContentService",
    "ai_quiz_service",
    "ai_source_content_service",
    "ai_content_service",
]
