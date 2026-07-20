import asyncio
import argparse
import json
import os
from pathlib import Path
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select

from app.db.session import get_session_maker
from app.models.user import User
from app.models.course import Course
from app.models.review import Review
from app.models.enrollment import Enrollment


from app.services.review import ReviewService


async def seed_reviews_command(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            reviews_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file '{file_path}': {e}")
        return
    except Exception as e:
        print(f"Error reading file '{file_path}': {e}")
        return

    if not isinstance(reviews_data, list):
        print("Error: Fixture file must contain a JSON array (list) of reviews.")
        return

    session_maker = get_session_maker()
    print(f"Starting seed process for {len(reviews_data)} reviews...\n")

    async with session_maker() as db:
        for idx, review_info in enumerate(reviews_data, 1):
            course_slug = review_info.get("course_slug")
            username = review_info.get("student_username")
            rating = review_info.get("rating", 5.0)
            body = review_info.get("body")
            is_active = review_info.get("is_active", True)

            # Look up course by slug
            res_course = await db.execute(select(Course).where(Course.slug == course_slug))
            course = res_course.scalars().first()
            if not course:
                print(f"Warning: Course with slug '{course_slug}' not found. Skipping review.")
                continue

            # Look up student by username
            res_user = await db.execute(select(User).where(User.username == username))
            student = res_user.scalars().first()
            if not student:
                print(f"Warning: User with username '{username}' not found. Skipping review.")
                continue

            # Ensure student is enrolled in the course to pass review validations
            res_enrollment = await db.execute(
                select(Enrollment).where(Enrollment.user_id == student.id, Enrollment.course_id == course.id)
            )
            if not res_enrollment.scalars().first():
                enrollment = Enrollment(user_id=student.id, course_id=course.id, progress=0)
                db.add(enrollment)
                await db.flush()

            # Check if review already exists
            res_existing = await db.execute(
                select(Review).where(Review.course_id == course.id, Review.student_id == student.id)
            )
            if res_existing.scalars().first():
                print(f"Review by '{username}' for course '{course_slug}' already exists. Skipping.")
                continue

            review = Review(
                course_id=course.id,
                student_id=student.id,
                rating=rating,
                body=body,
                is_active=is_active
            )
            
            try:
                db.add(review)
                await db.commit()
                await ReviewService.update_course_rating(db, course.id)
                print(f"Created review for '{course.title}' by student '{username}' (Rating: {rating})")
            except IntegrityError as e:
                await db.rollback()
                print(f"Database Integrity Error creating review at index {idx}: {e}")
            except Exception as e:
                await db.rollback()
                print(f"Error creating review at index {idx}: {e}")

        # Recalculate average rating for all courses to ensure consistency
        res_courses = await db.execute(select(Course))
        courses = res_courses.scalars().all()
        for course in courses:
            await ReviewService.update_course_rating(db, course.id)

    print("\nReview seed process completed successfully!")


def main():
    default_path = Path(__file__).parent / "data.json"
    
    parser = argparse.ArgumentParser(description="Seed database with reviews from a JSON fixture file.")
    parser.add_argument(
        "--file",
        default=str(default_path),
        help=f"Path to JSON fixtures file (default: {default_path})",
    )

    args = parser.parse_args()
    asyncio.run(seed_reviews_command(args.file))


if __name__ == "__main__":
    main()
