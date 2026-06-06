import math
from sqlalchemy import desc, select
from sqlalchemy.orm import joinedload
from app.models.category import Category
from app.models.user import Instructor, User
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.course import Course, CourseBadge, CourseLevel
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
            raise ValueError(
                f"Instructor with id {course_in.instructor_id} does not exist"
            )

        # Validate Category
        if course_in.category_id:
            category = await category_repo.get_category_by_id(db, course_in.category_id)
            if not category:
                raise ValueError(
                    f"Category with id {course_in.category_id} does not exist"
                )

        db_course = Course(**course_in.model_dump(exclude={"slug"}))
        db_course.slug = slug
        return await course_repo.create_course(db, db_course)

    @staticmethod
    async def get_course(db: AsyncSession, course_id: int) -> dict | None:
        course = await course_repo.get_course_by_id(db, course_id)
        if not course:
            return None
        return {"data": course}

    @staticmethod
    async def get_courses(
        db: AsyncSession,
        page: int = 1,
        size: int = 10,
        term: str | None = None,
        is_active: bool | None = None,
        badge: CourseBadge | None = None,
        level: CourseLevel | None = None,
    ) -> dict:
        query = (
            select(Course)
            .order_by(desc(Course.id))
            .options(
                joinedload(Course.instructor).load_only(
                    User.id, User.first_name, User.last_name
                ),
                joinedload(Course.category).load_only(Category.id, Category.name),
            )
        )

        if term:
            query = query.where(Course.title.ilike(f"%{term}%"))
        if is_active is not None:
            query = query.where(Course.is_active == is_active)
        if badge is not None:
            query = query.where(Course.badge == badge)
        if level is not None:
            query = query.where(Course.level == level)

        skip = (page - 1) * size
        total = await course_repo.count_courses(db, query=query)
        data = await course_repo.get_courses(db, query=query, skip=skip, limit=size)
        total_pages = math.ceil(total / size) if total else 0

        return {
            "data": data,
            "meta": {
                "total": total,
                "page": page,
                "size": size,
                "pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1,
            },
        }

    @staticmethod
    async def update_course(
        db: AsyncSession, course_id: int, course_in: CourseUpdate
    ) -> Course:
        course = await course_repo.get_course_by_id(db, course_id)
        if not course:
            raise ValueError("Course not found")

        update_data = course_in.model_dump(exclude_unset=True)

        if "title" in update_data and "slug" not in update_data:
            update_data["slug"] = slugify(update_data["title"])

        if "slug" in update_data and update_data["slug"] != course.slug:
            existing_slug = await course_repo.get_course_by_slug(
                db, update_data["slug"]
            )
            if existing_slug:
                raise ValueError(
                    f"Course with slug '{update_data['slug']}' already exists"
                )

        # Validate relations if they changed
        if "instructor_id" in update_data:
            instructor = await user_repo.get_user_by_id(
                db, update_data["instructor_id"]
            )
            if not instructor:
                raise ValueError(
                    f"Instructor with id {update_data['instructor_id']} does not exist"
                )

        if "category_id" in update_data and update_data["category_id"]:
            category = await category_repo.get_category_by_id(
                db, update_data["category_id"]
            )
            if not category:
                raise ValueError(
                    f"Category with id {update_data['category_id']} does not exist"
                )

        for field, value in update_data.items():
            setattr(course, field, value)

        return await course_repo.update_course(db, course)

    @staticmethod
    async def delete_course(db: AsyncSession, course_id: int):
        course = await course_repo.get_course_by_id(db, course_id)
        if not course:
            raise ValueError("Course not found")
        await course_repo.delete_course(db, course)

    @staticmethod
    async def meta(db: AsyncSession) -> dict:
        return {
            "data": {
                "categories": await category_repo.get_category_choices(db),
                "instructors": await user_repo.get_instructor_choices(db),
            }
        }
