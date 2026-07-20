from typing import Any, Generic, TypeVar

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: type[ModelType]):
        self.model = model

    async def get_by_id(self, db: AsyncSession, id: int) -> ModelType | None:
        stmt = select(self.model).where(self.model.id == id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_public_id(
        self, db: AsyncSession, public_id: str
    ) -> ModelType | None:
        stmt = select(self.model).where(self.model.public_id == public_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_multi(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100,
        filters: dict[str, Any] = None,
        order_by: str = None,
        order_desc: bool = False,
    ) -> list[ModelType]:
        stmt = select(self.model)
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key) and value is not None:
                    stmt = stmt.where(getattr(self.model, key) == value)

        if order_by and hasattr(self.model, order_by):
            col = getattr(self.model, order_by)
            if order_desc:
                stmt = stmt.order_by(col.desc())
            else:
                stmt = stmt.order_by(col)

        stmt = stmt.offset(skip).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def count(self, db: AsyncSession, *, filters: dict[str, Any] = None) -> int:
        stmt = select(func.count(self.model.id))
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key) and value is not None:
                    stmt = stmt.where(getattr(self.model, key) == value)

        result = await db.execute(stmt)
        return result.scalar_one()

    async def create(self, db: AsyncSession, *, obj_in: dict[str, Any]) -> ModelType:
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        await db.flush()
        return db_obj

    async def update(
        self, db: AsyncSession, *, db_obj: ModelType, obj_in: dict[str, Any]
    ) -> ModelType:
        for field, value in obj_in.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        db.add(db_obj)
        await db.flush()
        return db_obj

    async def remove(self, db: AsyncSession, *, id: int) -> ModelType:
        obj = await self.get_by_id(db=db, id=id)
        if obj:
            await db.delete(obj)
            await db.flush()
        return obj
