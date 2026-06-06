from sqlalchemy.ext.asyncio import AsyncSession
from app.models.module import Module
from app.repositories import module as module_repo
from app.repositories import course as course_repo
from app.schemas.module import ModuleCreate, ModuleUpdate
from typing import List, Optional

class ModuleService:
    @staticmethod
    async def create_module(db: AsyncSession, module_in: ModuleCreate) -> Module:
        """Create a new module with validation."""
        course = await course_repo.get_course_by_id(db, module_in.course_id)
        if not course:
            raise ValueError(f"Course with id {module_in.course_id} does not exist")
            
        if module_in.order_index == 0:
            from sqlalchemy import select, func
            result = await db.execute(
                select(func.max(Module.order_index)).where(Module.course_id == module_in.course_id)
            )
            max_order = result.scalar()
            module_in.order_index = 0 if max_order is None else max_order + 1
            
        db_module = Module(**module_in.model_dump())
        try:
            return await module_repo.create_module(db, db_module)
        except Exception as e:
            if "uq_course_module_order" in str(e):
                 raise ValueError(f"Module with order {module_in.order_index} already exists in this course")
            raise e

    @staticmethod
    async def get_module(db: AsyncSession, module_id: int) -> Optional[Module]:
        return await module_repo.get_module_by_id(db, module_id)

    @staticmethod
    async def get_modules_by_course(db: AsyncSession, course_id: int) -> List[Module]:
        return await module_repo.get_modules_by_course(db, course_id)

    @staticmethod
    async def update_module(db: AsyncSession, module_id: int, module_in: ModuleUpdate) -> Module:
        module = await module_repo.get_module_by_id(db, module_id)
        if not module:
            raise ValueError("Module not found")

        update_data = module_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(module, field, value)

        try:
            return await module_repo.update_module(db, module)
        except Exception as e:
            if "uq_course_module_order" in str(e):
                 raise ValueError(f"Module with order {module_in.order_index} already exists in this course")
            raise e

    @staticmethod
    async def delete_module(db: AsyncSession, module_id: int):
        module = await module_repo.get_module_by_id(db, module_id)
        if not module:
            raise ValueError("Module not found")
        await module_repo.delete_module(db, module)

    @staticmethod
    async def reorder_modules(db: AsyncSession, course_id: int, order: List[dict]) -> None:
        from fastapi import HTTPException, status
        
        # 1. Fetch and validate all modules
        modules_to_update = []
        for item in order:
            module = await module_repo.get_module_by_id(db, item["id"])
            if not module or module.course_id != course_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Module {item['id']} does not belong to course {course_id}",
                )
            modules_to_update.append((module, item["order_index"]))
            
        # 2. Assign temporary safe order_index to avoid UNIQUE constraint violation on flush
        for module, _ in modules_to_update:
            module.order_index = -module.id
            
        await db.flush()
        
        # 3. Assign final order_index
        for module, new_order in modules_to_update:
            module.order_index = new_order
            
        await db.commit()

# Functional aliases
async def create_module(db: AsyncSession, module_in: ModuleCreate) -> Module:
    return await ModuleService.create_module(db, module_in)

async def get_module(db: AsyncSession, module_id: int) -> Optional[Module]:
    return await ModuleService.get_module(db, module_id)

async def get_modules_by_course(db: AsyncSession, course_id: int) -> List[Module]:
    return await ModuleService.get_modules_by_course(db, course_id)

async def update_module(db: AsyncSession, module_id: int, module_in: ModuleUpdate) -> Module:
    return await ModuleService.update_module(db, module_id, module_in)

async def delete_module(db: AsyncSession, module_id: int):
    return await ModuleService.delete_module(db, module_id)

async def reorder_modules(db: AsyncSession, course_id: int, order: List[dict]) -> None:
    return await ModuleService.reorder_modules(db, course_id, order)
