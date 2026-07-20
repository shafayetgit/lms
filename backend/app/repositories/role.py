from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.role import Role
from app.repositories.base import BaseRepository


class RoleRepository(BaseRepository[Role]):
    async def get_multi(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100,
        filters: dict[str, Any] = None,
        order_by: str = None,
        order_desc: bool = False,
    ) -> list[Role]:
        stmt = select(self.model).where(self.model.name != "Super Admin")
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
        stmt = select(func.count(self.model.id)).where(self.model.name != "Super Admin")
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key) and value is not None:
                    stmt = stmt.where(getattr(self.model, key) == value)

        result = await db.execute(stmt)
        return result.scalar_one()


role_repo = RoleRepository(Role)
