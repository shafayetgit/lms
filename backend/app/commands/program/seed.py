import asyncio
import argparse
import json
import os
import sys
from pathlib import Path
from sqlalchemy import select

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parents[3]))

from app.db.session import get_session_maker
from app.models.program import Program, ProgramCourse
from app.models.course import Course


async def seed_programs_command(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            programs_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file '{file_path}': {e}")
        return
    except Exception as e:
        print(f"Error reading file '{file_path}': {e}")
        return

    if not isinstance(programs_data, list):
        print("Error: Fixture file must contain a JSON array (list) of programs.")
        return

    session_maker = get_session_maker()
    print(f"Starting seed process for {len(programs_data)} programs...\n")

    async with session_maker() as db:
        # Load all courses into a dictionary for quick lookup by slug
        course_res = await db.execute(select(Course))
        courses_by_slug = {c.slug: c.id for c in course_res.scalars().all()}

        for idx, prog_info in enumerate(programs_data, 1):
            title = prog_info.get("title")
            if not title:
                print(f"Warning: Skipping program entry at index {idx} due to missing title.")
                continue

            # Check if program exists
            existing_res = await db.execute(select(Program).where(Program.title == title))
            program = existing_res.scalars().first()

            if not program:
                program = Program(
                    title=title,
                    description=prog_info.get("description"),
                    published=prog_info.get("published", True),
                    enforce_course_order=prog_info.get("enforce_course_order", False),
                    course_count=0,
                    member_count=0
                )
                db.add(program)
                await db.flush()
                print(f"Created program: '{title}' (ID: {program.id})")
            else:
                print(f"Program '{title}' already exists (ID: {program.id}).")

            # Seed courses relationship
            courses_list = prog_info.get("courses", [])
            if courses_list:
                # Get current associated course ids
                current_courses_res = await db.execute(
                    select(ProgramCourse.course_id).where(ProgramCourse.program_id == program.id)
                )
                current_course_ids = set(current_courses_res.scalars().all())

                added_count = 0
                for c_idx, p_course in enumerate(courses_list, 1):
                    slug = p_course.get("course_slug")
                    if not slug or slug not in courses_by_slug:
                        print(f"  Warning: Skipping course association slug '{slug}' (not found in database)")
                        continue

                    course_id = courses_by_slug[slug]
                    if course_id not in current_course_ids:
                        assoc = ProgramCourse(
                            program_id=program.id,
                            course_id=course_id,
                            order_index=p_course.get("order_index", c_idx)
                        )
                        db.add(assoc)
                        current_course_ids.add(course_id)
                        added_count += 1

                if added_count > 0:
                    program.course_count = len(current_course_ids)
                    await db.commit()
                    print(f"  -> Associated {added_count} courses with program '{title}'")
                else:
                    await db.commit()

    print("\nProgram seed process completed successfully!")


def register_program_commands(subparsers):
    parser_programs = subparsers.add_parser(
        "seedprograms", help="Seed programs from JSON file"
    )
    parser_programs.add_argument(
        "--file",
        type=str,
        default=str(Path(__file__).parent / "data.json"),
        help="Path to programs JSON fixture file",
    )


def handle_program_commands(args) -> bool:
    if args.command == "seedprograms":
        asyncio.run(seed_programs_command(args.file))
        return True
    return False


def main():
    default_path = Path(__file__).parent / "data.json"

    parser = argparse.ArgumentParser(description="Seed database with programs from a JSON fixture file.")
    parser.add_argument(
        "--file",
        default=str(default_path),
        help=f"Path to JSON fixtures file (default: {default_path})",
    )

    args = parser.parse_args()
    asyncio.run(seed_programs_command(args.file))


if __name__ == "__main__":
    main()
