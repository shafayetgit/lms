import asyncio
import argparse
import json
import os
from pathlib import Path
from sqlalchemy.exc import IntegrityError

from app.db.session import get_session_maker
from app.schemas.category import CategoryCreate
from app.models.category import CategoryBadge
from app.services.category import CategoryService
from app.repositories import category as category_repo
from app.utils.string import slugify


async def seed_categories_command(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            categories = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file '{file_path}': {e}")
        return
    except Exception as e:
        print(f"Error reading file '{file_path}': {e}")
        return

    if not isinstance(categories, list):
        print("Error: Fixture file must contain a JSON array (list) of categories.")
        return

    # First pass: map 1-based indices to slugs to resolve parents
    index_to_slug = {}
    for idx, cat in enumerate(categories, 1):
        slug = cat.get("slug") or slugify(cat.get("name", ""))
        index_to_slug[idx] = slug

    session_maker = get_session_maker()
    slug_to_id = {}

    print(f"Starting seed process for {len(categories)} categories...\n")

    async with session_maker() as db:
        for idx, cat_data in enumerate(categories, 1):
            name = cat_data.get("name")
            if not name:
                print(f"Warning: Skipping category at index {idx} because it is missing a name.")
                continue

            slug = cat_data.get("slug") or slugify(name)
            description = cat_data.get("description")
            is_active = cat_data.get("is_active", True)
            badge_str = cat_data.get("badge", "none")
            thumbnail = cat_data.get("thumbnail")

            # Parse badge
            try:
                badge = CategoryBadge(badge_str)
            except ValueError:
                badge = CategoryBadge.NONE
                print(f"Warning: Invalid badge '{badge_str}' for category '{name}'. Using 'none'.")

            # Resolve parent_id from 1-based index to DB ID
            parent_idx = cat_data.get("parent_id")
            parent_id = None
            if parent_idx is not None:
                parent_slug = index_to_slug.get(parent_idx)
                if parent_slug:
                    parent_id = slug_to_id.get(parent_slug)
                    if not parent_id:
                        # Fallback: check if the parent already exists in DB
                        existing_parent = await category_repo.get_category_by_slug(db, parent_slug)
                        if existing_parent:
                            parent_id = existing_parent.id
                            slug_to_id[parent_slug] = parent_id
                        else:
                            print(f"Warning: Parent category (index {parent_idx}, slug '{parent_slug}') not found in DB or current run. Creating '{name}' without parent.")

            # Check if category with this slug already exists
            existing = await category_repo.get_category_by_slug(db, slug)
            if existing:
                print(f"Category '{name}' ({slug}) already exists (ID: {existing.id}). Skipping creation.")
                slug_to_id[slug] = existing.id
                continue

            # Create the category
            category_in = CategoryCreate(
                name=name,
                slug=slug,
                parent_id=parent_id,
                description=description,
                is_active=is_active,
                badge=badge,
                thumbnail=thumbnail,
            )

            try:
                category = await CategoryService.create_category(db, category_in)
                print(f"Created category: '{category.name}' -> ID: {category.id}, Slug: '{category.slug}', Parent ID: {category.parent_id}")
                slug_to_id[slug] = category.id
            except IntegrityError as e:
                await db.rollback()
                print(f"Database Integrity Error creating '{name}': {e}")
            except Exception as e:
                await db.rollback()
                print(f"Error creating category '{name}': {e}")

    print("\nSeed process completed successfully!")

def main():
    default_path = Path(__file__).parent / "data.json"
    
    parser = argparse.ArgumentParser(description="Seed database with categories from a JSON fixture file.")
    parser.add_argument(
        "--file",
        default=str(default_path),
        help=f"Path to JSON fixtures file (default: {default_path})",
    )

    args = parser.parse_args()
    asyncio.run(seed_categories_command(args.file))


if __name__ == "__main__":
    main()
