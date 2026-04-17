from sqlalchemy.ext.asyncio import AsyncSession
from app.models.lesson import Lesson
from app.repositories import lesson as lesson_repo
from app.repositories import module as module_repo
from app.schemas.lesson import LessonCreate, LessonUpdate
from app.utils.string import slugify
from typing import List, Optional

class LessonService:
    @staticmethod
    async def create_lesson(db: AsyncSession, lesson_in: LessonCreate) -> Lesson:
        """Create a new lesson with validation and slug generation."""
        # 1. Validate module exists
        module = await module_repo.get_module_by_id(db, lesson_in.module_id)
        if not module:
            raise ValueError(f"Module with id {lesson_in.module_id} does not exist")

        # 2. Handle slug
        slug = lesson_in.slug or slugify(lesson_in.title)
        existing_slug = await lesson_repo.get_lesson_by_slug(db, slug)
        if existing_slug:
            raise ValueError(f"Lesson with slug '{slug}' already exists")

        db_lesson = Lesson(**lesson_in.model_dump(exclude={"slug"}))
        db_lesson.slug = slug
        
        try:
            return await lesson_repo.create_lesson(db, db_lesson)
        except Exception as e:
            if "uq_module_lesson_order" in str(e):
                 raise ValueError(f"Lesson with order {lesson_in.order_index} already exists in this module")
            raise e

    @staticmethod
    async def get_lesson(db: AsyncSession, lesson_id: int) -> Optional[Lesson]:
        return await lesson_repo.get_lesson_by_id(db, lesson_id)

    @staticmethod
    async def get_lessons_by_module(db: AsyncSession, module_id: int) -> List[Lesson]:
        return await lesson_repo.get_lessons_by_module(db, module_id)

    @staticmethod
    async def update_lesson(db: AsyncSession, lesson_id: int, lesson_in: LessonUpdate) -> Lesson:
        lesson = await lesson_repo.get_lesson_by_id(db, lesson_id)
        if not lesson:
            raise ValueError("Lesson not found")

        update_data = lesson_in.model_dump(exclude_unset=True)
        
        if "title" in update_data and "slug" not in update_data:
            update_data["slug"] = slugify(update_data["title"])
            
        if "slug" in update_data and update_data["slug"] != lesson.slug:
            existing_slug = await lesson_repo.get_lesson_by_slug(db, update_data["slug"])
            if existing_slug:
                 raise ValueError(f"Lesson with slug '{update_data['slug']}' already exists")

        for field, value in update_data.items():
            setattr(lesson, field, value)

        try:
            return await lesson_repo.update_lesson(db, lesson)
        except Exception as e:
            if "uq_module_lesson_order" in str(e):
                 raise ValueError(f"Lesson with order {lesson.order_index} already exists in this module")
            raise e

    @staticmethod
    async def delete_lesson(db: AsyncSession, lesson_id: int):
        lesson = await lesson_repo.get_lesson_by_id(db, lesson_id)
        if not lesson:
            raise ValueError("Lesson not found")
        await lesson_repo.delete_lesson(db, lesson)

# Functional aliases
async def create_lesson(db: AsyncSession, lesson_in: LessonCreate) -> Lesson:
    return await LessonService.create_lesson(db, lesson_in)

async def get_lesson(db: AsyncSession, lesson_id: int) -> Optional[Lesson]:
    return await LessonService.get_lesson(db, lesson_id)

async def get_lessons_by_module(db: AsyncSession, module_id: int) -> List[Lesson]:
    return await LessonService.get_lessons_by_module(db, module_id)

async def update_lesson(db: AsyncSession, lesson_id: int, lesson_in: LessonUpdate) -> Lesson:
    return await LessonService.update_lesson(db, lesson_id, lesson_in)

async def delete_lesson(db: AsyncSession, lesson_id: int):
    return await LessonService.delete_lesson(db, lesson_id)
