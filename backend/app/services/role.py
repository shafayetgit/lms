from typing import Any

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.role import Role
from app.repositories.role import role_repo
from app.schemas.role import RoleCreate, RoleUpdate


class RoleService:
    @staticmethod
    async def get(db: AsyncSession, public_id: str) -> Role:
        role = await role_repo.get_by_public_id(db, public_id)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        return role

    @staticmethod
    async def list(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        filters: dict[str, Any] = None,
    ) -> tuple[list[Role], int]:
        items = await role_repo.get_multi(db, skip=skip, limit=limit, filters=filters)
        total = await role_repo.count(db, filters=filters)
        return items, total

    @staticmethod
    async def create(db: AsyncSession, obj_in: RoleCreate) -> Role:
        db_obj = await role_repo.create(
            db, obj_in=obj_in.model_dump(exclude_unset=True)
        )
        await db.commit()
        return db_obj

    @staticmethod
    async def update(db: AsyncSession, public_id: str, obj_in: RoleUpdate) -> Role:
        role = await RoleService.get(db, public_id)
        db_obj = await role_repo.update(
            db, db_obj=role, obj_in=obj_in.model_dump(exclude_unset=True)
        )
        await db.commit()
        return db_obj

    @staticmethod
    async def delete(db: AsyncSession, public_id: str) -> None:
        role = await RoleService.get(db, public_id)
        if role.is_system:
            raise HTTPException(status_code=400, detail="Cannot delete a system role")
        await role_repo.remove(db, id=role.id)
        await db.commit()
