from typing import Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.ai_source_content import AISourceContent
from app.repositories.ai_source_content import ai_source_content_repo


class AISourceContentService:
    async def get_source_content(
        self, db: AsyncSession, public_id: str
    ) -> AISourceContent | None:
        return await ai_source_content_repo.get_by_public_id(db, public_id)

    async def get_generation_status(
        self, db: AsyncSession, public_id: str
    ) -> dict[str, Any] | None:
        """
        Retrieves real-time status and gets draft quiz public ID if generation is completed.
        """
        stmt = (
            select(AISourceContent)
            .where(AISourceContent.public_id == public_id)
            .options(selectinload(AISourceContent.draft_quizzes))
        )
        result = await db.execute(stmt)
        source = result.scalar_one_or_none()
        if not source:
            return None

        draft_quiz_public_id = None
        if source.draft_quizzes:
            draft_quiz_public_id = source.draft_quizzes[0].public_id

        return {
            "public_id": source.public_id,
            "status": source.status,
            "error_message": source.error_message,
            "celery_task_id": source.celery_task_id,
            "draft_quiz_public_id": draft_quiz_public_id,
            "created_at": source.created_at,
        }


ai_source_content_service = AISourceContentService()
