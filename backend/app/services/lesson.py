from sqlalchemy.ext.asyncio import AsyncSession
from app.models.lesson import Lesson
from app.repositories import lesson as lesson_repo
from app.repositories import chapter as chapter_repo
from app.repositories import course as course_repo
from app.schemas.lesson import LessonCreate, LessonUpdate
from app.utils.string import slugify
from typing import List, Optional

class LessonService:
    @staticmethod
    async def create_lesson(db: AsyncSession, lesson_in: LessonCreate) -> Lesson:
        """Create a new lesson with validation and slug generation."""
        # Resolve chapter public_id -> integer PK
        chapter = await chapter_repo.get_chapter_by_id(db, lesson_in.chapter_id)
        if not chapter:
            raise ValueError(f"Chapter '{lesson_in.chapter_id}' does not exist")

        # Resolve course_id — accepts public_id (str) or integer PK; fall back to chapter.course_id
        if lesson_in.course_id:
            cid = lesson_in.course_id
            if isinstance(cid, int):
                course = await course_repo.get_course_by_id(db, cid)
            else:
                course = await course_repo.get_course_by_public_id(db, str(cid))
            resolved_course_id = course.id if course else chapter.course_id
        else:
            resolved_course_id = chapter.course_id

        # Build lesson data with resolved integer FKs
        lesson_data = lesson_in.model_dump(exclude={"slug", "chapter_id", "course_id"})
        lesson_data["chapter_id"] = chapter.id
        lesson_data["course_id"] = resolved_course_id

        # Validate that assignment_id and quiz_id are not already linked to another lesson
        if lesson_data.get("assignment_id") is not None:
            from sqlalchemy import select
            stmt = select(Lesson).where(Lesson.assignment_id == lesson_data["assignment_id"])
            res = await db.execute(stmt)
            if res.scalars().first() is not None:
                raise ValueError("This assignment is already assigned to another lesson.")

        if lesson_data.get("quiz_id") is not None:
            from sqlalchemy import select
            stmt = select(Lesson).where(Lesson.quiz_id == lesson_data["quiz_id"])
            res = await db.execute(stmt)
            if res.scalars().first() is not None:
                raise ValueError("This quiz is already assigned to another lesson.")

        # Handle slug
        slug = lesson_in.slug or slugify(lesson_in.title)
        existing_slug = await lesson_repo.get_lesson_by_slug_and_chapter(db, slug, chapter.id)
        if existing_slug:
            raise ValueError(f"Lesson with slug '{slug}' already exists in this chapter")

        # Handle order_index
        if lesson_in.order_index == 0:
            from sqlalchemy import select, func
            result = await db.execute(
                select(func.max(Lesson.order_index)).where(Lesson.chapter_id == chapter.id)
            )
            max_order = result.scalar()
            lesson_data["order_index"] = 0 if max_order is None else max_order + 1

        db_lesson = Lesson(**lesson_data)
        db_lesson.slug = slug

        try:
            return await lesson_repo.create_lesson(db, db_lesson)
        except Exception as e:
            if "uq_chapter_lesson_order" in str(e):
                raise ValueError(f"Lesson with order {lesson_data['order_index']} already exists in this chapter")
            raise e

    @staticmethod
    async def get_lesson(db: AsyncSession, lesson_id: int | str) -> Optional[Lesson]:
        return await lesson_repo.get_lesson_by_id(db, lesson_id)

    @staticmethod
    async def get_lessons_by_chapter(db: AsyncSession, chapter_id: int | str) -> List[Lesson]:
        return await lesson_repo.get_lessons_by_chapter(db, chapter_id)

    @staticmethod
    async def update_lesson(db: AsyncSession, lesson_id: int | str, lesson_in: LessonUpdate) -> Lesson:
        lesson = await lesson_repo.get_lesson_by_id(db, lesson_id)
        if not lesson:
            raise ValueError("Lesson not found")

        update_data = lesson_in.model_dump(exclude_unset=True)

        # Validate that assignment_id and quiz_id are not already linked to another lesson
        if "assignment_id" in update_data and update_data["assignment_id"] is not None and update_data["assignment_id"] != lesson.assignment_id:
            from sqlalchemy import select
            stmt = select(Lesson).where(
                Lesson.assignment_id == update_data["assignment_id"],
                Lesson.id != lesson.id
            )
            res = await db.execute(stmt)
            if res.scalars().first() is not None:
                raise ValueError("This assignment is already assigned to another lesson.")

        if "quiz_id" in update_data and update_data["quiz_id"] is not None and update_data["quiz_id"] != lesson.quiz_id:
            from sqlalchemy import select
            stmt = select(Lesson).where(
                Lesson.quiz_id == update_data["quiz_id"],
                Lesson.id != lesson.id
            )
            res = await db.execute(stmt)
            if res.scalars().first() is not None:
                raise ValueError("This quiz is already assigned to another lesson.")
        
        if "title" in update_data and "slug" not in update_data:
            update_data["slug"] = slugify(update_data["title"])
            
        if "slug" in update_data and update_data["slug"] != lesson.slug:
            existing_slug = await lesson_repo.get_lesson_by_slug_and_chapter(
                db, update_data["slug"], lesson.chapter_id
            )
            if existing_slug:
                 raise ValueError(f"Lesson with slug '{update_data['slug']}' already exists in this chapter")

        for field, value in update_data.items():
            setattr(lesson, field, value)

        try:
            return await lesson_repo.update_lesson(db, lesson)
        except Exception as e:
            if "uq_chapter_lesson_order" in str(e):
                 raise ValueError(f"Lesson with order {lesson.order_index} already exists in this chapter")
            raise e

    @staticmethod
    async def delete_lesson(db: AsyncSession, lesson_id: int | str):
        lesson = await lesson_repo.get_lesson_by_id(db, lesson_id)
        if not lesson:
            raise ValueError("Lesson not found")
        await lesson_repo.delete_lesson(db, lesson)

    @staticmethod
    async def reorder_lessons(db: AsyncSession, chapter_id: int | str, order: List[dict]) -> None:
        from fastapi import HTTPException, status
        
        if isinstance(chapter_id, str) and not chapter_id.isdigit():
            chapter = await chapter_repo.get_chapter_by_id(db, chapter_id)
            if not chapter:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
            target_chapter_id = chapter.id
        else:
            target_chapter_id = int(chapter_id)

        # 1. Fetch and validate all lessons
        lessons_to_update = []
        for item in order:
            lesson = await lesson_repo.get_lesson_by_id(db, item["id"])
            if not lesson or lesson.chapter_id != target_chapter_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Lesson {item['id']} does not belong to chapter {chapter_id}",
                )
            lessons_to_update.append((lesson, item["order_index"]))
            
        # 2. Assign temporary safe order_index to avoid UNIQUE constraint violation on flush
        for lesson, _ in lessons_to_update:
            lesson.order_index = -lesson.id
            
        await db.flush()
        
        # 3. Assign final order_index
        for lesson, new_order in lessons_to_update:
            lesson.order_index = new_order
            
        await db.commit()

# Functional aliases
async def create_lesson(db: AsyncSession, lesson_in: LessonCreate) -> Lesson:
    return await LessonService.create_lesson(db, lesson_in)

async def get_lesson(db: AsyncSession, lesson_id: int | str) -> Optional[Lesson]:
    return await LessonService.get_lesson(db, lesson_id)

async def get_lessons_by_chapter(db: AsyncSession, chapter_id: int | str) -> List[Lesson]:
    return await LessonService.get_lessons_by_chapter(db, chapter_id)

async def update_lesson(db: AsyncSession, lesson_id: int | str, lesson_in: LessonUpdate) -> Lesson:
    return await LessonService.update_lesson(db, lesson_id, lesson_in)

async def delete_lesson(db: AsyncSession, lesson_id: int | str):
    return await LessonService.delete_lesson(db, lesson_id)

async def reorder_lessons(db: AsyncSession, chapter_id: int | str, order: List[dict]) -> None:
    return await LessonService.reorder_lessons(db, chapter_id, order)
