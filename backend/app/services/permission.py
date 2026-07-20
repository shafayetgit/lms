from typing import Any

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.permission import Permission
from app.repositories.permission import permission_repo
from app.repositories.role import role_repo
from app.schemas.permission import PermissionCreate, PermissionUpdate


class PermissionService:
    @staticmethod
    async def get(db: AsyncSession, public_id: str) -> Permission:
        permission = await permission_repo.get_by_public_id(db, public_id)
        if not permission:
            raise HTTPException(status_code=404, detail="Permission not found")
        return permission

    @staticmethod
    async def list(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        filters: dict[str, Any] = None,
    ) -> tuple[list[Permission], int]:
        items = await permission_repo.get_multi(
            db, skip=skip, limit=limit, filters=filters
        )
        total = await permission_repo.count(db, filters=filters)
        return items, total

    @staticmethod
    async def create(db: AsyncSession, obj_in: PermissionCreate) -> Permission:
        role = await role_repo.get_by_public_id(db, obj_in.role_public_id)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")

        data = obj_in.model_dump(exclude={"role_public_id"}, exclude_unset=True)
        data["role_id"] = role.id
        db_obj = await permission_repo.create(db, obj_in=data)
        db_obj.role = role
        await db.commit()
        return db_obj

    @staticmethod
    async def update(
        db: AsyncSession, public_id: str, obj_in: PermissionUpdate
    ) -> Permission:
        permission = await PermissionService.get(db, public_id)
        db_obj = await permission_repo.update(
            db, db_obj=permission, obj_in=obj_in.model_dump(exclude_unset=True)
        )
        await db.commit()
        return db_obj

    @staticmethod
    async def delete(db: AsyncSession, public_id: str) -> None:
        permission = await PermissionService.get(db, public_id)
        await permission_repo.remove(db, id=permission.id)
        await db.commit()
