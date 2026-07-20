import asyncio
import argparse
import json
import os
from pathlib import Path
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select

from app.db.session import get_session_maker
from app.models.course import Course
from app.models.chapter import Chapter
from app.models.lesson import Lesson, LessonType
from app.models.quiz import Quiz
from app.models.assignment import Assignment
from app.models.category import Category
from app.models.user import User
from app.utils.string import slugify


async def seed_courses_command(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            courses_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file '{file_path}': {e}")
        return
    except Exception as e:
        print(f"Error reading file '{file_path}': {e}")
        return

    if not isinstance(courses_data, list):
        print("Error: Fixture file must contain a JSON array (list) of courses.")
        return

    session_maker = get_session_maker()
    print(f"Starting seed process for {len(courses_data)} courses...\n")

    async with session_maker() as db:
        for idx, course_info in enumerate(courses_data, 1):
            title = course_info.get("title")
            if not title:
                print(f"Warning: Skipping course at index {idx} because it is missing a title.")
                continue

            slug = course_info.get("slug") or slugify(title)
            from sqlalchemy.orm import selectinload

            # Check if course exists
            result = await db.execute(
                select(Course)
                .options(selectinload(Course.instructors))
                .where(Course.slug == slug)
            )
            existing_course = result.scalars().first()

            # Resolve category
            category_id = None
            category_slug = course_info.get("category_slug")
            if category_slug:
                cat_res = await db.execute(select(Category).where(Category.slug == category_slug))
                found_cat = cat_res.scalars().first()
                if found_cat:
                    category_id = found_cat.id
                else:
                    print(f"Warning: Category with slug '{category_slug}' not found for course '{title}'.")

            # Resolve instructors
            instructor_usernames = course_info.get("instructors", [])
            instructor_users = []
            for username in instructor_usernames:
                res_inst = await db.execute(select(User).where(User.username == username))
                inst_user = res_inst.scalars().first()
                if inst_user:
                    instructor_users.append(inst_user)
                else:
                    print(f"Warning: Instructor '{username}' not found for course '{title}'.")

            # Shared field values for create or update
            course_fields = dict(
                title=title,
                slug=slug,
                category_id=category_id,
                short_introduction=course_info.get("short_introduction"),
                overview=course_info.get("overview") or course_info.get("description"),
                thumbnail=course_info.get("thumbnail"),
                video=course_info.get("video"),
                tags=course_info.get("tags"),
                published=course_info.get("published", True),
                upcoming=course_info.get("upcoming", False),
                featured=course_info.get("featured", False),
                disable_self_learning=course_info.get("disable_self_learning", False),
                paid_course=course_info.get("paid_course", False),
                paid_certificate=course_info.get("paid_certificate", False),
                course_price=course_info.get("course_price", 0.0),
                currency=course_info.get("currency", "BDT"),
                enable_certification=course_info.get("enable_certification", True),
                card_gradient=course_info.get("card_gradient"),
            )

            try:
                if existing_course:
                    # Update existing course fields
                    for field, value in course_fields.items():
                        setattr(existing_course, field, value)

                    # Rebuild instructors
                    existing_course.instructors.clear()
                    for user in instructor_users:
                        existing_course.instructors.append(user)

                    # Wipe existing chapters (cascades to lessons)
                    old_chapters = await db.execute(select(Chapter).where(Chapter.course_id == existing_course.id))
                    for ch in old_chapters.scalars().all():
                        await db.delete(ch)
                    await db.flush()

                    course = existing_course
                    print(f"Updated Course: '{course.title}' (ID: {course.id})")
                else:
                    course = Course(**course_fields)
                    for user in instructor_users:
                        course.instructors.append(user)
                    db.add(course)
                    await db.flush()
                    print(f"Created Course: '{course.title}' (ID: {course.id}, Instructors: {len(course.instructors)})")

                # Seed chapters & lessons
                chapters_data = course_info.get("chapters", [])
                total_lessons = 0
                for c_idx, chap_info in enumerate(chapters_data, 1):
                    chap_title = chap_info.get("title", f"Chapter {c_idx}")
                    chapter = Chapter(
                        course_id=course.id,
                        title=chap_title,
                        description=chap_info.get("description"),
                        order_index=chap_info.get("order_index", c_idx),
                    )
                    db.add(chapter)
                    await db.flush()

                    lessons_data = chap_info.get("lessons", [])
                    for l_idx, less_info in enumerate(lessons_data, 1):
                        less_title = less_info.get("title", f"Lesson {l_idx}")
                        less_slug = slugify(less_title)
                        video_url = less_info.get("video_url") or course_info.get("video")

                        content_type_str = less_info.get("content_type", "video")
                        if content_type_str == "quiz":
                            lesson_type = LessonType.QUIZ
                        elif content_type_str == "assignment":
                            lesson_type = LessonType.ASSIGNMENT
                        else:
                            lesson_type = LessonType.VIDEO

                        quiz_id = None
                        if lesson_type == LessonType.QUIZ:
                            quiz_title = less_info.get("quiz_title")
                            if quiz_title:
                                q_res = await db.execute(select(Quiz).where(Quiz.title == quiz_title))
                                found_quiz = q_res.scalars().first()
                                if found_quiz:
                                    quiz_id = found_quiz.id

                        assignment_id = None
                        if lesson_type == LessonType.ASSIGNMENT:
                            assignment_title = less_info.get("assignment_title")
                            if assignment_title:
                                a_res = await db.execute(select(Assignment).where(Assignment.title == assignment_title))
                                found_assignment = a_res.scalars().first()
                                if found_assignment:
                                    assignment_id = found_assignment.id

                        lesson = Lesson(
                            chapter_id=chapter.id,
                            course_id=course.id,
                            title=less_title,
                            slug=less_slug,
                            lesson_type=lesson_type,
                            youtube=video_url if lesson_type == LessonType.VIDEO else None,
                            quiz_id=quiz_id,
                            assignment_id=assignment_id,
                            duration=less_info.get("duration", 300),
                            include_in_preview=less_info.get("is_preview", False),
                            order_index=less_info.get("order_index", l_idx),
                        )
                        db.add(lesson)
                        total_lessons += 1

                course.total_lessons = total_lessons
                await db.commit()
                print(f"  └─ {len(chapters_data)} chapters, {total_lessons} lessons seeded.")
            except IntegrityError as e:
                await db.rollback()
                print(f"Database Integrity Error for course '{title}': {e}")
            except Exception as e:
                await db.rollback()
                print(f"Error processing course '{title}': {e}")


    print("\nCourse seed process completed successfully!")


def register_course_commands(subparsers):
    parser_courses = subparsers.add_parser(
        "seedcourses", help="Seed courses with YouTube video URLs"
    )
    parser_courses.add_argument(
        "--file",
        type=str,
        default=str(Path(__file__).parent / "data.json"),
        help="Path to courses JSON fixture file",
    )


def handle_course_commands(args) -> bool:
    if args.command == "seedcourses":
        asyncio.run(seed_courses_command(args.file))
        return True
    return False


def main():
    default_path = Path(__file__).parent / "data.json"

    parser = argparse.ArgumentParser(description="Seed database with courses from a JSON fixture file.")
    parser.add_argument(
        "--file",
        default=str(default_path),
        help=f"Path to JSON fixtures file (default: {default_path})",
    )

    args = parser.parse_args()
    asyncio.run(seed_courses_command(args.file))


if __name__ == "__main__":
    main()
