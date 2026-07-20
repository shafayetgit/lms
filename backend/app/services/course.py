import math
from app.services import instructor
from sqlalchemy import desc, select, func
from sqlalchemy.orm import joinedload
from app.models.category import Category
from app.models.user import User, Role
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.course import Course
from app.models.course_instructor import CourseInstructor
from app.repositories import course as course_repo
from app.repositories import category as category_repo
from app.repositories import user as user_repo
from app.schemas.course import CourseCreate, CourseUpdate
from app.utils.string import slugify
from typing import List, Optional
from app.models.tracking import RelatedCourse
from app.repositories import tracking as tracking_repo


class CourseService:
    @staticmethod
    async def create_course(db: AsyncSession, course_in: CourseCreate) -> Course:
        """Create a new course with slug generation and validation."""
        slug = course_in.slug or slugify(course_in.title)

        # Check if slug exists
        existing_slug = await course_repo.get_course_by_slug(db, slug)
        if existing_slug:
            raise ValueError(f"Course with slug '{slug}' already exists")

        # Validate Instructors
        if not course_in.instructor_public_ids:
            raise ValueError("At least one instructor must be provided")

        instructor_ids = []
        for instructor_pub_id in course_in.instructor_public_ids:
            instructor = await user_repo.get_user_by_public_id(db, instructor_pub_id)
            if not instructor:
                raise ValueError(f"Instructor with public id {instructor_pub_id} does not exist")
            instructor_ids.append(instructor.id)

        # Validate Category
        category_id = None
        if course_in.category_public_id:
            category = await category_repo.get_category_by_public_id(db, course_in.category_public_id)
            if not category:
                raise ValueError(
                    f"Category with public id {course_in.category_public_id} does not exist"
                )
            category_id = category.id

        # Prepare create dictionary
        create_data = course_in.model_dump(exclude={"slug", "instructor_public_ids", "related_course_public_ids", "category_public_id", "total_quizzes", "total_assignments"})
        db_course = Course(**create_data)
        db_course.slug = slug
        db_course.category_id = category_id
        
        created_course = await course_repo.create_course(db, db_course)

        # Add instructors to junction table
        for idx, inst_id in enumerate(instructor_ids):
            db_course_instructor = CourseInstructor(
                course_id=created_course.id,
                instructor_id=inst_id,
                order_index=idx + 1,
            )
            db.add(db_course_instructor)
        await db.commit()

        # Handle related courses
        if course_in.related_course_public_ids is not None:
            related_list = []
            for idx, related_pub_id in enumerate(course_in.related_course_public_ids):
                result = await db.execute(select(Course).where(Course.public_id == related_pub_id))
                related_course = result.scalars().first()
                if not related_course:
                    raise ValueError(f"Related course with public id {related_pub_id} does not exist")
                if related_course.id == created_course.id:
                    continue
                related_list.append(
                    RelatedCourse(
                        course_id=created_course.id,
                        related_course_id=related_course.id,
                        order_index=idx
                    )
                )
            await tracking_repo.replace_related_courses(db, created_course.id, related_list)

        return await course_repo.get_course_by_public_id(db, created_course.public_id)

    @staticmethod
    async def get_course(db: AsyncSession, public_id: str) -> dict | None:
        course = await course_repo.get_course_by_public_id(db, public_id)
        if not course:
            course = await course_repo.get_course_by_slug(db, public_id)
        if not course:
            return None
        return {"data": course}

    @staticmethod
    async def get_courses(
        db: AsyncSession,
        page: int = 1,
        size: int = 10,
        term: str | None = None,
        published: bool | None = None,
        upcoming: bool | None = None,
        owner_id: int | None = None,
    ) -> dict:
        query = (
            select(Course)
            .order_by(desc(Course.id))
            .options(
                joinedload(Course.instructors).load_only(
                    User.id, User.public_id, User.first_name, User.last_name
                ),
                joinedload(Course.category).load_only(Category.id, Category.public_id, Category.name),
            )
        )

        if owner_id is not None:
            query = query.where(Course.owner_id == owner_id)
        if term:
            query = query.where(Course.title.ilike(f"%{term}%"))
        if published is not None:
            query = query.where(Course.published == published)
        if upcoming is not None:
            query = query.where(Course.upcoming == upcoming)

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
        db: AsyncSession, public_id: str, course_in: CourseUpdate
    ) -> Course:
        course = await course_repo.get_course_by_public_id(db, public_id)
        if not course:
            raise ValueError("Course not found")

        update_data = course_in.model_dump(exclude_unset=True, exclude={"related_course_public_ids", "instructor_public_ids", "category_public_id"})

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

        if course_in.category_public_id is not None:
            if course_in.category_public_id == "":
                course.category_id = None
            else:
                category = await category_repo.get_category_by_public_id(
                    db, course_in.category_public_id
                )
                if not category:
                    raise ValueError(
                        f"Category with public id {course_in.category_public_id} does not exist"
                    )
                course.category_id = category.id

        for field, value in update_data.items():
            setattr(course, field, value)
        await course_repo.update_course(db, course)
        
        # Handle instructors
        if course_in.instructor_public_ids is not None:
            if not course_in.instructor_public_ids:
                raise ValueError("At least one instructor must be provided")
            
            instructor_ids = []
            for inst_pub_id in course_in.instructor_public_ids:
                instructor = await user_repo.get_user_by_public_id(db, inst_pub_id)
                if not instructor:
                    raise ValueError(f"Instructor with public id {inst_pub_id} does not exist")
                instructor_ids.append(instructor.id)
            
            # Remove existing instructors
            from sqlalchemy import delete
            await db.execute(delete(CourseInstructor).where(CourseInstructor.course_id == course.id))
            
            # Add new instructors
            for idx, inst_id in enumerate(instructor_ids):
                db_course_instructor = CourseInstructor(
                    course_id=course.id,
                    instructor_id=inst_id,
                    order_index=idx + 1,
                )
                db.add(db_course_instructor)
            await db.commit()

        # Handle related courses
        if course_in.related_course_public_ids is not None:
            related_list = []
            for idx, related_pub_id in enumerate(course_in.related_course_public_ids):
                result = await db.execute(select(Course).where(Course.public_id == related_pub_id))
                related_course = result.scalars().first()
                if not related_course:
                    raise ValueError(f"Related course with public id {related_pub_id} does not exist")
                if related_course.id == course.id:
                    continue
                related_list.append(
                    RelatedCourse(
                        course_id=course.id,
                        related_course_id=related_course.id,
                        order_index=idx
                    )
                )
            await tracking_repo.replace_related_courses(db, course.id, related_list)
            
        return await course_repo.get_course_by_public_id(db, public_id)

    @staticmethod
    async def delete_course(db: AsyncSession, public_id: str):
        course = await course_repo.get_course_by_public_id(db, public_id)
        if not course:
            raise ValueError("Course not found")
        await course_repo.delete_course(db, course)

    @staticmethod
    async def meta(db: AsyncSession) -> dict:
        cat_stmt = (
            select(Category.public_id.label("value"), Category.name.label("label"))
            .where(Category.is_active)
            .order_by(Category.name)
        )

        instructor_stmt = (
            select(
                User.public_id.label("value"),
                func.concat(
                    User.first_name,
                    " ",
                    User.last_name,
                ).label("label"),
            )
            .join(User.roles)
            .where(Role.slug == "instructor", User.is_active)
        )

        student_stmt = (
            select(
                User.public_id.label("value"),
                func.concat(
                    User.first_name,
                    " ",
                    User.last_name,
                ).label("label"),
            )
            .join(User.roles)
            .where(Role.slug == "student", User.is_active)
        )

        return {
            "categories": await category_repo.get_category_choices(db, query=cat_stmt),
            "instructors": await user_repo.get_instructor_choices(
                db, query=instructor_stmt
            ),
            "students": await user_repo.get_instructor_choices(
                db, query=student_stmt
            ),
            "courses": await course_repo.get_course_choices(db)
        }

    @staticmethod
    async def get_dashboard(db: AsyncSession, public_id: str) -> dict:
        """Return analytics data for a course dashboard."""
        from app.models.enrollment import Enrollment
        from app.models.course_progress import CourseProgress
        from app.models.chapter import Chapter
        from app.models.lesson import Lesson

        course = await course_repo.get_course_by_public_id(db, public_id)
        if not course:
            raise ValueError("Course not found")

        course_id = course.id

        # -- KPI: total enrollments
        total_enrollments_result = await db.execute(
            select(func.count(Enrollment.id)).where(Enrollment.course_id == course_id)
        )
        total_enrollments = total_enrollments_result.scalar() or 0

        # -- KPI: average progress
        avg_progress_result = await db.execute(
            select(func.avg(Enrollment.progress)).where(Enrollment.course_id == course_id)
        )
        average_progress = round(float(avg_progress_result.scalar() or 0), 1)

        # -- Progress distribution buckets
        enrollments_result = await db.execute(
            select(Enrollment.progress).where(Enrollment.course_id == course_id)
        )
        progress_values = enrollments_result.scalars().all()

        buckets = {"just_started": 0, "in_progress": 0, "advanced": 0, "completed": 0}
        for p in progress_values:
            if p < 10:
                buckets["just_started"] += 1
            elif p < 50:
                buckets["in_progress"] += 1
            elif p < 100:
                buckets["advanced"] += 1
            else:
                buckets["completed"] += 1

        # -- Lesson completion stats
        chapters_result = await db.execute(
            select(Chapter).where(Chapter.course_id == course_id).order_by(Chapter.order_index)
        )
        chapters = chapters_result.scalars().all()

        lesson_stats = []
        for ch_idx, chapter in enumerate(chapters):
            lessons_result = await db.execute(
                select(Lesson)
                .where(Lesson.chapter_id == chapter.id, Lesson.is_active == True)
                .order_by(Lesson.order_index)
            )
            lessons = lessons_result.scalars().all()
            for l_idx, lesson in enumerate(lessons):
                count_result = await db.execute(
                    select(func.count(CourseProgress.id)).where(
                        CourseProgress.lesson_id == lesson.id,
                        CourseProgress.is_completed == True,
                    )
                )
                completion_count = count_result.scalar() or 0
                lesson_stats.append({
                    "lesson_id": lesson.public_id,
                    "title": lesson.title,
                    "chapter_idx": ch_idx + 1,
                    "lesson_idx": l_idx + 1,
                    "completion_count": completion_count,
                    "completion_rate": round(
                        (completion_count / total_enrollments * 100) if total_enrollments else 0, 1
                    ),
                })

        return {
            "total_enrollments": total_enrollments,
            "average_progress": average_progress,
            "total_lessons": course.total_lessons,
            "rating": round(float(course.rating or 0), 1),
            "progress_distribution": buckets,
            "lesson_stats": lesson_stats,
        }

