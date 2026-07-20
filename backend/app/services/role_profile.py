from typing import Any

from fastapi import HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.role_profile import RoleProfile, RoleProfileRoleAssociation
from app.repositories.role import role_repo
from app.repositories.role_profile import role_profile_repo
from app.schemas.role_profile import RoleProfileCreate, RoleProfileUpdate


class RoleProfileService:
    @staticmethod
    async def get(db: AsyncSession, public_id: str) -> RoleProfile:
        stmt = (
            select(RoleProfile)
            .where(RoleProfile.public_id == public_id)
            .options(selectinload(RoleProfile.roles))
        )
        result = await db.execute(stmt)
        role_profile = result.scalar_one_or_none()
        if not role_profile:
            raise HTTPException(status_code=404, detail="Role Profile not found")
        return role_profile

    @staticmethod
    async def list(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        filters: dict[str, Any] = None,
    ) -> tuple[list[RoleProfile], int]:
        stmt = (
            select(RoleProfile)
            .options(selectinload(RoleProfile.roles))
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        items = list(result.scalars().all())
        total = await role_profile_repo.count(db, filters=filters)
        return items, total

    @staticmethod
    async def create(db: AsyncSession, obj_in: RoleProfileCreate) -> RoleProfile:
        data = obj_in.model_dump(exclude={"role_public_ids"}, exclude_unset=True)
        db_obj = await role_profile_repo.create(db, obj_in=data)
        await db.flush()

        if obj_in.role_public_ids is not None:
            for role_pub_id in obj_in.role_public_ids:
                role_obj = await role_repo.get_by_public_id(db, role_pub_id)
                if role_obj:
                    assoc = RoleProfileRoleAssociation(
                        role_profile_id=db_obj.id, role_id=role_obj.id
                    )
                    db.add(assoc)

        await db.commit()
        stmt = (
            select(RoleProfile)
            .where(RoleProfile.id == db_obj.id)
            .options(selectinload(RoleProfile.roles))
        )
        res = await db.execute(stmt)
        return res.scalar_one()

    @staticmethod
    async def update(
        db: AsyncSession, public_id: str, obj_in: RoleProfileUpdate
    ) -> RoleProfile:
        role_profile = await RoleProfileService.get(db, public_id)
        data = obj_in.model_dump(exclude={"role_public_ids"}, exclude_unset=True)
        db_obj = await role_profile_repo.update(db, db_obj=role_profile, obj_in=data)

        if obj_in.role_public_ids is not None:
            await db.execute(
                delete(RoleProfileRoleAssociation).where(
                    RoleProfileRoleAssociation.role_profile_id == db_obj.id
                )
            )
            for role_pub_id in obj_in.role_public_ids:
                role_obj = await role_repo.get_by_public_id(db, role_pub_id)
                if role_obj:
                    assoc = RoleProfileRoleAssociation(
                        role_profile_id=db_obj.id, role_id=role_obj.id
                    )
                    db.add(assoc)

        await db.commit()
        stmt = (
            select(RoleProfile)
            .where(RoleProfile.id == db_obj.id)
            .options(selectinload(RoleProfile.roles))
        )
        res = await db.execute(stmt)
        return res.scalar_one()

    @staticmethod
    async def delete(db: AsyncSession, public_id: str) -> None:
        role_profile = await RoleProfileService.get(db, public_id)
        await role_profile_repo.remove(db, id=role_profile.id)
        await db.commit()
