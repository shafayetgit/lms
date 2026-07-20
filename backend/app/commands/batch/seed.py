import sys
import asyncio
import argparse
import json
import os
from pathlib import Path
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import selectinload

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parents[3]))

from app.db.session import get_session_maker
from app.models.batch import Batch, BatchTimetable, BatchCourse
from app.models.course import Course


def parse_date(date_str):
    if not date_str:
        return None
    return datetime.strptime(date_str, "%Y-%m-%d").date()


def parse_time(time_str):
    if not time_str:
        return None
    return datetime.strptime(time_str, "%H:%M:%S").time()


async def seed_batches_command(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            batches_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file '{file_path}': {e}")
        return
    except Exception as e:
        print(f"Error reading file '{file_path}': {e}")
        return

    if not isinstance(batches_data, list):
        print("Error: Fixture file must contain a JSON array (list) of batches.")
        return

    session_maker = get_session_maker()
    print(f"Starting seed process for {len(batches_data)} batches...\n")

    async with session_maker() as db:
        for idx, b_data in enumerate(batches_data, 1):
            title = b_data.get("title")
            if not title:
                print(f"Warning: Skipping batch entry at index {idx} due to missing title.")
                continue

            existing_res = await db.execute(
                select(Batch).where(Batch.title == title).options(selectinload(Batch.timetables))
            )
            batch = existing_res.scalars().first()

            if not batch:
                batch = Batch(
                    title=title,
                    description=b_data.get("description"),
                    batch_details=b_data.get("batch_details"),
                    start_date=parse_date(b_data.get("start_date")),
                    end_date=parse_date(b_data.get("end_date")),
                    start_time=parse_time(b_data.get("start_time")),
                    end_time=parse_time(b_data.get("end_time")),
                    timezone=b_data.get("timezone", "UTC"),
                    published=b_data.get("published", True),
                    allow_self_enrollment=b_data.get("allow_self_enrollment", True),
                    seat_count=b_data.get("seat_count", 0),
                    medium=b_data.get("medium", "Online"),
                    paid_batch=b_data.get("paid_batch", False),
                    amount=b_data.get("amount"),
                    currency=b_data.get("currency"),
                    evaluation=b_data.get("evaluation", False),
                    evaluation_end_date=parse_date(b_data.get("evaluation_end_date")),
                    certification=b_data.get("certification", False),
                )
                db.add(batch)
                await db.commit()
                # Re-query batch with timetables loaded to avoid lazy loading in async session
                existing_res = await db.execute(
                    select(Batch).where(Batch.id == batch.id).options(selectinload(Batch.timetables))
                )
                batch = existing_res.scalar_one()
                print(f"Created batch: '{title}' (ID: {batch.id})")
            else:
                print(f"Batch '{title}' already exists (ID: {batch.id}).")

            # Seed timetables if provided in JSON
            timetables = b_data.get("timetables", [])
            if timetables:
                existing_topics = {t.topic for t in (batch.timetables or [])}
                added_count = 0
                for tt in timetables:
                    topic = tt.get("topic")
                    if topic and topic not in existing_topics:
                        entry = BatchTimetable(
                            batch_id=batch.id,
                            topic=topic,
                            date=parse_date(tt.get("date")),
                            start_time=parse_time(tt.get("start_time")),
                            end_time=parse_time(tt.get("end_time")),
                            description=tt.get("description"),
                            meeting_link=tt.get("meeting_link"),
                        )
                        db.add(entry)
                        added_count += 1
                if added_count > 0:
                    await db.commit()
                    print(f"  -> Added {added_count} timetable entry(ies) for '{title}'")

            # Seed batch courses if provided
            courses_list = b_data.get("courses", [])
            if courses_list:
                for c_slug in courses_list:
                    c_res = await db.execute(select(Course).where(Course.slug == c_slug))
                    course_obj = c_res.scalars().first()
                    if course_obj:
                        # Check if BatchCourse exists
                        bc_res = await db.execute(
                            select(BatchCourse).where(
                                BatchCourse.batch_id == batch.id,
                                BatchCourse.course_id == course_obj.id
                            )
                        )
                        bc_obj = bc_res.scalars().first()
                        if not bc_obj:
                            db.add(BatchCourse(batch_id=batch.id, course_id=course_obj.id))
                await db.commit()

    print("\nBatch seed process completed successfully!")


def main():
    default_path = Path(__file__).parent / "data.json"

    parser = argparse.ArgumentParser(description="Seed database with batches from a JSON fixture file.")
    parser.add_argument(
        "--file",
        default=str(default_path),
        help=f"Path to JSON fixtures file (default: {default_path})",
    )

    args = parser.parse_args()
    asyncio.run(seed_batches_command(args.file))


if __name__ == "__main__":
    main()
