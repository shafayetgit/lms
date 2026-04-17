from sqlalchemy.ext.asyncio import AsyncSession
from app.models.course import Course
from app.repositories import course as course_repo
from app.repositories import category as category_repo
from app.repositories import user as user_repo
from app.schemas.course import CourseCreate, CourseUpdate
from app.utils.string import slugify
from typing import List, Optional

class CourseService:
    @staticmethod
    async def create_course(db: AsyncSession, course_in: CourseCreate) -> Course:
        """Create a new course with slug generation and validation."""
        slug = course_in.slug or slugify(course_in.title)
        
        # Check if slug exists
        existing_slug = await course_repo.get_course_by_slug(db, slug)
        if existing_slug:
            raise ValueError(f"Course with slug '{slug}' already exists")

        # Validate Instructor (User)
        instructor = await user_repo.get_user_by_id(db, course_in.instructor_id)
        if not instructor:
            raise ValueError(f"Instructor with id {course_in.instructor_id} does not exist")
            
        # Validate Category
        if course_in.category_id:
            category = await category_repo.get_category_by_id(db, course_in.category_id)
            if not category:
                raise ValueError(f"Category with id {course_in.category_id} does not exist")

        db_course = Course(
            **course_in.model_dump(exclude={"slug"})
        )
        db_course.slug = slug
        return await course_repo.create_course(db, db_course)

    @staticmethod
    async def get_course(db: AsyncSession, course_id: int) -> Optional[Course]:
        return await course_repo.get_course_by_id(db, course_id)

    @staticmethod
    async def get_courses(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Course]:
        return await course_repo.get_courses(db, skip=skip, limit=limit)

    @staticmethod
    async def update_course(db: AsyncSession, course_id: int, course_in: CourseUpdate) -> Course:
        course = await course_repo.get_course_by_id(db, course_id)
        if not course:
            raise ValueError("Course not found")

        update_data = course_in.model_dump(exclude_unset=True)
        
        if "title" in update_data and "slug" not in update_data:
            update_data["slug"] = slugify(update_data["title"])
            
        if "slug" in update_data and update_data["slug"] != course.slug:
            existing_slug = await course_repo.get_course_by_slug(db, update_data["slug"])
            if existing_slug:
                raise ValueError(f"Course with slug '{update_data['slug']}' already exists")

        # Validate relations if they changed
        if "instructor_id" in update_data:
            instructor = await user_repo.get_user_by_id(db, update_data["instructor_id"])
            if not instructor:
                raise ValueError(f"Instructor with id {update_data['instructor_id']} does not exist")
                
        if "category_id" in update_data and update_data["category_id"]:
            category = await category_repo.get_category_by_id(db, update_data["category_id"])
            if not category:
                raise ValueError(f"Category with id {update_data['category_id']} does not exist")

        for field, value in update_data.items():
            setattr(course, field, value)

        return await course_repo.update_course(db, course)

    @staticmethod
    async def delete_course(db: AsyncSession, course_id: int):
        course = await course_repo.get_course_by_id(db, course_id)
        if not course:
            raise ValueError("Course not found")
        await course_repo.delete_course(db, course)

# Functional aliases
async def create_course(db: AsyncSession, course_in: CourseCreate) -> Course:
    return await CourseService.create_course(db, course_in)

async def get_course(db: AsyncSession, course_id: int) -> Optional[Course]:
    return await CourseService.get_course(db, course_id)

async def get_courses(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Course]:
    return await CourseService.get_courses(db, skip=skip, limit=limit)

async def update_course(db: AsyncSession, course_id: int, course_in: CourseUpdate) -> Course:
    return await CourseService.update_course(db, course_id, course_in)

async def delete_course(db: AsyncSession, course_id: int):
    return await CourseService.delete_course(db, course_id)
