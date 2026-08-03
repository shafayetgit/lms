from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.ai_quiz import AIDraftQuiz
from app.repositories.base import BaseRepository


class AIDraftQuizRepository(BaseRepository[AIDraftQuiz]):
    async def get_by_public_id(
        self, db: AsyncSession, public_id: str
    ) -> AIDraftQuiz | None:
        stmt = (
            select(self.model)
            .where(self.model.public_id == public_id)
            .options(
                selectinload(self.model.source_content),
                selectinload(self.model.confirmed_quiz),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_pending_drafts(
        self, db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> list[AIDraftQuiz]:
        """
        Helper to fetch drafts awaiting human review.
        """
        stmt = (
            select(self.model)
            .where(self.model.status == "pending_review")
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_user_drafts(
        self, db: AsyncSession, owner_id: int, skip: int = 0, limit: int = 100
    ) -> list[AIDraftQuiz]:
        """
        Fetch pending drafts for a specific user.
        """
        stmt = (
            select(self.model)
            .where(
                self.model.owner_id == owner_id,
                self.model.status == "pending_review"
            )
            .options(
                selectinload(self.model.source_content),
                selectinload(self.model.confirmed_quiz),
            )
            .order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())


ai_draft_quiz_repo = AIDraftQuizRepository(AIDraftQuiz)
