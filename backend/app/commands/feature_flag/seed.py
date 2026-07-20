import sys
import asyncio
import argparse
import json
import os
from pathlib import Path
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

# Add backend directory to sys.path to resolve 'app' imports
backend_dir = Path(__file__).resolve().parents[3]
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.db.session import get_session_maker
from app.models.feature_flag import FeatureFlag


async def seed_feature_flags_command(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            flags = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file '{file_path}': {e}")
        return
    except Exception as e:
        print(f"Error reading file '{file_path}': {e}")
        return

    if not isinstance(flags, list):
        print("Error: Fixture file must contain a JSON array (list) of feature flags.")
        return

    session_maker = get_session_maker()

    print(f"Starting seed process for {len(flags)} feature flags...\n")

    async with session_maker() as db:
        for idx, flag_data in enumerate(flags, 1):
            name = flag_data.get("name")
            slug = flag_data.get("slug") or name.lower().replace(" ", "-")
            description = flag_data.get("description")

            if not name or not slug:
                print(f"Warning: Skipping feature flag at index {idx} because it is missing a name or slug.")
                continue

            query = select(FeatureFlag).where((FeatureFlag.name == name) | (FeatureFlag.slug == slug))
            result = await db.execute(query)
            existing = result.scalars().first()
            
            if existing:
                print(f"Feature flag '{name}' ({slug}) already exists (ID: {existing.id}). Skipping creation.")
                continue

            flag = FeatureFlag(
                name=name,
                slug=slug,
                description=description
            )
            db.add(flag)
            try:
                await db.commit()
                print(f"Created feature flag: '{flag.name}' -> ID: {flag.id}, Slug: '{flag.slug}'")
            except IntegrityError as e:
                await db.rollback()
                print(f"Database Integrity Error creating '{name}': {e}")
            except Exception as e:
                await db.rollback()
                print(f"Error creating feature flag '{name}': {e}")

    print("\nSeed process completed successfully!")


def main():
    default_path = Path(__file__).parent / "data.json"
    
    parser = argparse.ArgumentParser(description="Seed database with feature flags from a JSON fixture file.")
    parser.add_argument(
        "--file",
        default=str(default_path),
        help=f"Path to JSON fixtures file (default: {default_path})",
    )

    args = parser.parse_args()
    asyncio.run(seed_feature_flags_command(args.file))


if __name__ == "__main__":
    main()
