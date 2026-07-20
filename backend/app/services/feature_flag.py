from typing import Any

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.feature_flag import FeatureFlag
from app.repositories.feature_flag import feature_flag_repo
from app.schemas.feature_flag import FeatureFlagCreate, FeatureFlagUpdate


class FeatureFlagService:
    @staticmethod
    async def get(db: AsyncSession, public_id: str) -> FeatureFlag:
        feature_flag = await feature_flag_repo.get_by_public_id(db, public_id)
        if not feature_flag:
            raise HTTPException(status_code=404, detail="Feature Flag not found")
        return feature_flag

    @staticmethod
    async def list(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        filters: dict[str, Any] = None,
    ) -> tuple[list[FeatureFlag], int]:
        items = await feature_flag_repo.get_multi(
            db, skip=skip, limit=limit, filters=filters
        )
        total = await feature_flag_repo.count(db, filters=filters)
        return items, total

    @staticmethod
    async def create(db: AsyncSession, obj_in: FeatureFlagCreate) -> FeatureFlag:
        db_obj = await feature_flag_repo.create(db, obj_in=obj_in.model_dump())
        await db.commit()
        return db_obj

    @staticmethod
    async def update(
        db: AsyncSession, public_id: str, obj_in: FeatureFlagUpdate
    ) -> FeatureFlag:
        feature_flag = await FeatureFlagService.get(db, public_id)
        db_obj = await feature_flag_repo.update(
            db, db_obj=feature_flag, obj_in=obj_in.model_dump(exclude_unset=True)
        )
        await db.commit()
        return db_obj

    @staticmethod
    async def delete(db: AsyncSession, public_id: str) -> None:
        feature_flag = await FeatureFlagService.get(db, public_id)
        if feature_flag.is_system:
            raise HTTPException(
                status_code=400, detail="System feature flags cannot be deleted"
            )
        await feature_flag_repo.remove(db, id=feature_flag.id)
        await db.commit()
