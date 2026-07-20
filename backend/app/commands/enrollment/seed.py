import sys
import asyncio
import argparse
import json
import os
from pathlib import Path
from sqlalchemy import select

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parents[3]))

from app.db.session import get_session_maker
from app.models.user import User
from app.models.course import Course
from app.models.batch import Batch
from app.models.enrollment import Enrollment, EnrollmentStatus


async def seed_enrollments_command(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            enrollments_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file '{file_path}': {e}")
        return
    except Exception as e:
        print(f"Error reading file '{file_path}': {e}")
        return

    if not isinstance(enrollments_data, list):
        print("Error: Fixture file must contain a JSON array (list) of enrollments.")
        return

    session_maker = get_session_maker()
    print(f"Starting seed process for {len(enrollments_data)} enrollments...\n")

    async with session_maker() as db:
        for idx, e_data in enumerate(enrollments_data, 1):
            username = e_data.get("student_username")
            course_slug = e_data.get("course_slug")
            batch_title = e_data.get("batch_title")

            if not username or not course_slug:
                print(f"Warning: Skipping enrollment entry at index {idx} due to missing student_username/course_slug.")
                continue

            # Fetch Student User
            user_res = await db.execute(select(User).where(User.username == username))
            user = user_res.scalars().first()
            if not user:
                print(f"Warning: Student '{username}' not found. Skipping enrollment.")
                continue

            # Fetch Course
            course_res = await db.execute(select(Course).where(Course.slug == course_slug))
            course = course_res.scalars().first()
            if not course:
                print(f"Warning: Course '{course_slug}' not found. Skipping enrollment.")
                continue

            # Fetch Batch if provided
            batch_id = None
            if batch_title:
                batch_res = await db.execute(select(Batch).where(Batch.title == batch_title))
                batch = batch_res.scalars().first()
                if batch:
                    batch_id = batch.id

            # Check if enrollment already exists
            existing = await db.execute(
                select(Enrollment).where(
                    Enrollment.user_id == user.id,
                    Enrollment.course_id == course.id,
                )
            )
            if existing.scalars().first():
                print(f"Enrollment for student '{username}' in course '{course_slug}' already exists. Skipping.")
                continue

            enrollment = Enrollment(
                user_id=user.id,
                course_id=course.id,
                batch_id=batch_id,
                status=EnrollmentStatus(e_data.get("status", "active")),
                is_active=True,
                progress=e_data.get("progress", 0.0),
                enrollment_from_batch=batch_id is not None,
            )
            db.add(enrollment)
            await db.commit()
            print(f"Enrolled student '{username}' in course '{course.title}' (ID: {enrollment.id})")

    print("\nEnrollment seed process completed successfully!")


def main():
    default_path = Path(__file__).parent / "data.json"

    parser = argparse.ArgumentParser(description="Seed database with enrollments from a JSON fixture file.")
    parser.add_argument(
        "--file",
        default=str(default_path),
        help=f"Path to JSON fixtures file (default: {default_path})",
    )

    args = parser.parse_args()
    asyncio.run(seed_enrollments_command(args.file))


if __name__ == "__main__":
    main()
