import asyncio
import argparse
import json
import os
from pathlib import Path
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.db.session import get_session_maker
from app.models.role import Role


async def seed_roles_command(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            roles = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file '{file_path}': {e}")
        return
    except Exception as e:
        print(f"Error reading file '{file_path}': {e}")
        return

    if not isinstance(roles, list):
        print("Error: Fixture file must contain a JSON array (list) of roles.")
        return

    session_maker = get_session_maker()

    print(f"Starting seed process for {len(roles)} roles...\n")

    async with session_maker() as db:
        for idx, role_data in enumerate(roles, 1):
            name = role_data.get("name")
            slug = role_data.get("slug")
            description = role_data.get("description")

            if not name or not slug:
                print(f"Warning: Skipping role at index {idx} because it is missing a name or slug.")
                continue

            # Check if role with this slug already exists
            query = select(Role).where(Role.slug == slug)
            result = await db.execute(query)
            existing = result.scalars().first()
            
            if existing:
                print(f"Role '{name}' ({slug}) already exists (ID: {existing.id}). Skipping creation.")
                continue

            # Create the role
            role = Role(
                name=name,
                slug=slug,
                description=description
            )
            db.add(role)
            try:
                await db.commit()
                print(f"Created role: '{role.name}' -> ID: {role.id}, Slug: '{role.slug}'")
            except IntegrityError as e:
                await db.rollback()
                print(f"Database Integrity Error creating '{name}': {e}")
            except Exception as e:
                await db.rollback()
                print(f"Error creating role '{name}': {e}")

    print("\nSeed process completed successfully!")


def main():
    default_path = Path(__file__).parent / "data.json"
    
    parser = argparse.ArgumentParser(description="Seed database with roles from a JSON fixture file.")
    parser.add_argument(
        "--file",
        default=str(default_path),
        help=f"Path to JSON fixtures file (default: {default_path})",
    )

    args = parser.parse_args()
    asyncio.run(seed_roles_command(args.file))


if __name__ == "__main__":
    main()
