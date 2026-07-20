from typing import Any

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.role import UserRoleAssociation
from app.repositories.role import role_repo
from app.repositories.user import user_repo
from app.repositories.user_role import user_role_repo
from app.schemas.user_role import UserRoleAssignmentCreate  # noqa: F401


class UserRoleAssignmentService:
    @staticmethod
    async def list(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        filters: dict[str, Any] = None,
    ) -> tuple[list[UserRoleAssociation], int]:
        items = await user_role_repo.get_multi(
            db, skip=skip, limit=limit, filters=filters
        )
        total = await user_role_repo.count(db, filters=filters)
        return items, total

    @staticmethod
    async def create(
        db: AsyncSession, obj_in: UserRoleAssignmentCreate
    ) -> UserRoleAssociation:
        user = await user_repo.get_by_public_id(db, obj_in.user_public_id)
        role = await role_repo.get_by_public_id(db, obj_in.role_public_id)

        if not user or not role:
            raise HTTPException(status_code=404, detail="User or Role not found")

        data = {"user_id": user.id, "role_id": role.id}
        db_obj = await user_role_repo.create(db, obj_in=data)
        await db.commit()
        return db_obj

    @staticmethod
    async def delete(db: AsyncSession, public_id: str) -> None:
        assignment = await user_role_repo.get_by_public_id(db, public_id)
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
        await user_role_repo.remove(db, id=assignment.id)
        await db.commit()
