import asyncio
import argparse
import json
import os
from pathlib import Path
from sqlalchemy.exc import IntegrityError

from app.db.session import get_session_maker
from app.schemas.badge import BadgeCreate, BadgeUpdate
from app.services import badge as badge_service
from app.repositories import badge as badge_repo


async def seed_badges_command(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            badges = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file '{file_path}': {e}")
        return
    except Exception as e:
        print(f"Error reading file '{file_path}': {e}")
        return

    if not isinstance(badges, list):
        print("Error: Fixture file must contain a JSON array (list) of badges.")
        return

    session_maker = get_session_maker()

    print(f"Starting seed process for {len(badges)} badges...\n")

    async with session_maker() as db:
        for idx, badge_data in enumerate(badges, 1):
            title = badge_data.get("title")
            if not title:
                print(f"Warning: Skipping badge at index {idx} because it is missing a title.")
                continue

            existing = await badge_repo.get_badge_by_title(db, title)
            badge_data_clean = {
                "description": badge_data.get("description"),
                "image": badge_data.get("image"),
                "is_active": badge_data.get("is_active", True),
                "reference_table": badge_data.get("reference_table"),
                "event": badge_data.get("event"),
                "user_field": badge_data.get("user_field"),
                "field_to_check": badge_data.get("field_to_check"),
                "condition": badge_data.get("condition"),
                "grant_only_once": badge_data.get("grant_only_once", True),
            }

            try:
                if existing:
                    update_in = BadgeUpdate(**badge_data_clean)
                    badge = await badge_service.update_badge(db, existing, update_in)
                    print(f"Updated badge: '{badge.title}' -> ID: {badge.id}")
                else:
                    badge_in = BadgeCreate(title=title, **badge_data_clean)
                    badge = await badge_service.create_badge(db, badge_in)
                    print(f"Created badge: '{badge.title}' -> ID: {badge.id}")
            except IntegrityError as e:
                await db.rollback()
                print(f"Database Integrity Error creating '{title}': {e}")
            except Exception as e:
                await db.rollback()
                print(f"Error creating badge '{title}': {e}")

    print("\nSeed process completed successfully!")


def main():
    default_path = Path(__file__).parent / "data.json"
    
    parser = argparse.ArgumentParser(description="Seed database with badges from a JSON fixture file.")
    parser.add_argument(
        "--file",
        default=str(default_path),
        help=f"Path to JSON fixtures file (default: {default_path})",
    )

    args = parser.parse_args()
    asyncio.run(seed_badges_command(args.file))


if __name__ == "__main__":
    main()
