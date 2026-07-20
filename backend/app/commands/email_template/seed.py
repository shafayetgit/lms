import asyncio
import argparse
import json
import os
from pathlib import Path
from sqlalchemy.exc import IntegrityError

from app.db.session import get_session_maker
from app.schemas.email_template import EmailTemplateCreate
from app.services.email_template import EmailTemplateService
from app.repositories.email_template import email_template_repo


async def seed_email_templates_command(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            templates = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file '{file_path}': {e}")
        return
    except Exception as e:
        print(f"Error reading file '{file_path}': {e}")
        return

    if not isinstance(templates, list):
        print("Error: Fixture file must contain a JSON array (list) of email templates.")
        return

    session_maker = get_session_maker()

    print(f"Starting seed process for {len(templates)} email templates...\n")

    async with session_maker() as db:
        for idx, template_data in enumerate(templates, 1):
            name = template_data.get("name")
            if not name:
                print(f"Warning: Skipping email template at index {idx} because it is missing a name.")
                continue

            subject = template_data.get("subject", "")
            content_type = template_data.get("content_type", "rich_text")
            content = template_data.get("content", "")
            enabled = template_data.get("enabled", True)

            # Check if template with this name already exists
            existing_list = await email_template_repo.get_multi(db, filters={"name": name})
            existing = existing_list[0] if existing_list else None
            if existing:
                print(f"Email template '{name}' already exists (ID: {existing.id}, Public ID: {existing.public_id}). Skipping creation.")
                continue

            # Create the email template
            template_in = EmailTemplateCreate(
                name=name,
                subject=subject,
                content_type=content_type,
                content=content,
                enabled=enabled
            )

            try:
                template = await EmailTemplateService.create(db, obj_in=template_in)
                print(f"Created email template: '{template.name}' -> ID: {template.id}, Public ID: '{template.public_id}'")
            except IntegrityError as e:
                await db.rollback()
                print(f"Database Integrity Error creating '{name}': {e}")
            except Exception as e:
                await db.rollback()
                print(f"Error creating email template '{name}': {e}")

    print("\nSeed process completed successfully!")


def main():
    default_path = Path(__file__).parent / "data.json"
    
    parser = argparse.ArgumentParser(description="Seed database with email templates from a JSON fixture file.")
    parser.add_argument(
        "--file",
        default=str(default_path),
        help=f"Path to JSON fixtures file (default: {default_path})",
    )

    args = parser.parse_args()
    asyncio.run(seed_email_templates_command(args.file))


if __name__ == "__main__":
    main()
