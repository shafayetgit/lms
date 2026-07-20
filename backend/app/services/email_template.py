from typing import Any, Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.email_template import EmailTemplate
from app.repositories.email_template import email_template_repo
from app.schemas.email_template import EmailTemplateCreate, EmailTemplateUpdate


class EmailTemplateService:
    @staticmethod
    async def list(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[dict[str, Any]] = None,
    ) -> tuple[list[EmailTemplate], int]:
        items = await email_template_repo.get_multi(
            db, skip=skip, limit=limit, filters=filters, order_by="created_at"
        )
        total = await email_template_repo.count(db, filters=filters)
        return items, total

    @staticmethod
    async def get(db: AsyncSession, public_id: str) -> EmailTemplate:
        obj = await email_template_repo.get_by_public_id(db, public_id)
        if not obj:
            raise HTTPException(status_code=404, detail="Email template not found")
        return obj

    @staticmethod
    async def create(db: AsyncSession, *, obj_in: EmailTemplateCreate) -> EmailTemplate:
        existing_list = await email_template_repo.get_multi(db, filters={"name": obj_in.name})
        existing = existing_list[0] if existing_list else None
        if existing:
            raise HTTPException(status_code=400, detail="An email template with this name already exists")
        
        data = obj_in.model_dump(exclude_unset=False)
        db_obj = await email_template_repo.create(db, obj_in=data)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    @staticmethod
    async def update(
        db: AsyncSession, *, public_id: str, obj_in: EmailTemplateUpdate
    ) -> EmailTemplate:
        obj = await EmailTemplateService.get(db, public_id=public_id)
        
        update_data = obj_in.model_dump(exclude_unset=True)
        if "name" in update_data and update_data["name"] != obj.name:
            existing_list = await email_template_repo.get_multi(db, filters={"name": update_data["name"]})
            existing = existing_list[0] if existing_list else None
            if existing:
                raise HTTPException(status_code=400, detail="An email template with this name already exists")
        
        db_obj = await email_template_repo.update(db, db_obj=obj, obj_in=update_data)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    @staticmethod
    async def delete(db: AsyncSession, public_id: str) -> None:
        obj = await EmailTemplateService.get(db, public_id=public_id)
        await email_template_repo.remove(db, id=obj.id)
        await db.commit()
