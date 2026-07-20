import sys
import asyncio
import argparse
import json
import os
from pathlib import Path

# Add project root to sys.path for direct script execution
sys.path.append(str(Path(__file__).resolve().parents[3]))

from sqlalchemy.exc import IntegrityError
from sqlalchemy import select

from app.db.session import get_session_maker
from app.models.assignment import Assignment, AssignmentType
from app.models.course import Course


async def seed_assignments_command(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            assignments_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file '{file_path}': {e}")
        return
    except Exception as e:
        print(f"Error reading file '{file_path}': {e}")
        return

    if not isinstance(assignments_data, list):
        print("Error: Fixture file must contain a JSON array (list) of assignments.")
        return

    session_maker = get_session_maker()
    print(f"Starting seed process for {len(assignments_data)} assignments...\n")

    async with session_maker() as db:
        # Fetch first course if available to link assignments
        course_res = await db.execute(select(Course).order_by(Course.id.asc()))
        course = course_res.scalars().first()
        default_course_id = course.id if course else None

        for idx, item in enumerate(assignments_data, 1):
            title = item.get("title")
            if not title:
                print(f"Warning: Skipping assignment at index {idx} because it is missing a title.")
                continue

            # Check if assignment with same title exists
            result = await db.execute(select(Assignment).where(Assignment.title == title))
            existing = result.scalars().first()

            if existing:
                print(f"Assignment '{title}' already exists (ID: {existing.id}). Skipping creation.")
                continue

            type_str = item.get("type", "Text")
            try:
                assignment_type = AssignmentType(type_str)
            except ValueError:
                assignment_type = AssignmentType.TEXT

            assignment = Assignment(
                title=title,
                type=assignment_type,
                question=item.get("question", ""),
                course_id=item.get("course_id", default_course_id),
                show_answer=item.get("show_answer", False),
                answer=item.get("answer"),
                grade_assignment=item.get("grade_assignment", True),
            )

            try:
                db.add(assignment)
                await db.commit()
                print(f"Created Assignment: '{assignment.title}' (ID: {assignment.id})")
            except IntegrityError as e:
                await db.rollback()
                print(f"Database Integrity Error creating assignment '{title}': {e}")
            except Exception as e:
                await db.rollback()
                print(f"Error creating assignment '{title}': {e}")

    print("\nAssignment seed process completed successfully!")


def main():
    default_path = Path(__file__).parent / "data.json"

    parser = argparse.ArgumentParser(description="Seed database with assignments from a JSON fixture file.")
    parser.add_argument(
        "--file",
        default=str(default_path),
        help=f"Path to JSON fixtures file (default: {default_path})",
    )

    args = parser.parse_args()
    asyncio.run(seed_assignments_command(args.file))


if __name__ == "__main__":
    main()
