from sqlalchemy.ext.asyncio import AsyncSession
from app.models.chapter import Chapter
from app.repositories import chapter as chapter_repo
from app.repositories import course as course_repo
from app.schemas.chapter import ChapterCreate, ChapterUpdate
from typing import List, Optional

class ChapterService:
    @staticmethod
    async def create_chapter(db: AsyncSession, chapter_in: ChapterCreate) -> Chapter:
        """Create a new chapter with validation."""
        if isinstance(chapter_in.course_id, str) and not str(chapter_in.course_id).isdigit():
            course = await course_repo.get_course_by_public_id(db, chapter_in.course_id)
        else:
            course = await course_repo.get_course_by_id(db, int(chapter_in.course_id))

        if not course:
            raise ValueError(f"Course '{chapter_in.course_id}' does not exist")

        chapter_data = chapter_in.model_dump()
        chapter_data["course_id"] = course.id

        if chapter_in.order_index == 0:
            from sqlalchemy import select, func
            result = await db.execute(
                select(func.max(Chapter.order_index)).where(Chapter.course_id == course.id)
            )
            max_order = result.scalar()
            chapter_data["order_index"] = 0 if max_order is None else max_order + 1

        db_chapter = Chapter(**chapter_data)
        try:
            return await chapter_repo.create_chapter(db, db_chapter)
        except Exception as e:
            if "uq_course_chapter_order" in str(e):
                raise ValueError(f"Chapter with order {chapter_data['order_index']} already exists in this course")
            raise e

    @staticmethod
    async def get_chapter(db: AsyncSession, chapter_id: int | str) -> Optional[Chapter]:
        return await chapter_repo.get_chapter_by_id(db, chapter_id)

    @staticmethod
    async def get_chapters_by_course(db: AsyncSession, course_id: int | str) -> List[Chapter]:
        return await chapter_repo.get_chapters_by_course(db, course_id)

    @staticmethod
    async def update_chapter(db: AsyncSession, chapter_id: int | str, chapter_in: ChapterUpdate) -> Chapter:
        chapter = await chapter_repo.get_chapter_by_id(db, chapter_id)
        if not chapter:
            raise ValueError("Chapter not found")

        update_data = chapter_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(chapter, field, value)

        try:
            return await chapter_repo.update_chapter(db, chapter)
        except Exception as e:
            if "uq_course_chapter_order" in str(e):
                raise ValueError(f"Chapter with order {chapter_in.order_index} already exists in this course")
            raise e

    @staticmethod
    async def delete_chapter(db: AsyncSession, chapter_id: int | str):
        chapter = await chapter_repo.get_chapter_by_id(db, chapter_id)
        if not chapter:
            raise ValueError("Chapter not found")
        await chapter_repo.delete_chapter(db, chapter)

    @staticmethod
    async def reorder_chapters(db: AsyncSession, course_id: int | str, order: List[dict]) -> None:
        from fastapi import HTTPException, status

        # Resolve course internal id if course_id is public_id
        if isinstance(course_id, str) and not course_id.isdigit():
            course = await course_repo.get_course_by_public_id(db, course_id)
            if not course:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
            target_course_id = course.id
        else:
            target_course_id = int(course_id)

        chapters_to_update = []
        for item in order:
            chapter = await chapter_repo.get_chapter_by_id(db, item["id"])
            if not chapter or chapter.course_id != target_course_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Chapter {item['id']} does not belong to course {course_id}",
                )
            chapters_to_update.append((chapter, item["order_index"]))

        for chapter, _ in chapters_to_update:
            chapter.order_index = -chapter.id

        await db.flush()

        for chapter, new_order in chapters_to_update:
            chapter.order_index = new_order

        await db.commit()

# Functional aliases
async def create_chapter(db: AsyncSession, chapter_in: ChapterCreate) -> Chapter:
    return await ChapterService.create_chapter(db, chapter_in)

async def get_chapter(db: AsyncSession, chapter_id: int | str) -> Optional[Chapter]:
    return await ChapterService.get_chapter(db, chapter_id)

async def get_chapters_by_course(db: AsyncSession, course_id: int | str) -> List[Chapter]:
    return await ChapterService.get_chapters_by_course(db, course_id)

async def update_chapter(db: AsyncSession, chapter_id: int | str, chapter_in: ChapterUpdate) -> Chapter:
    return await ChapterService.update_chapter(db, chapter_id, chapter_in)

async def delete_chapter(db: AsyncSession, chapter_id: int | str):
    return await ChapterService.delete_chapter(db, chapter_id)

async def reorder_chapters(db: AsyncSession, course_id: int | str, order: List[dict]) -> None:
    return await ChapterService.reorder_chapters(db, course_id, order)
