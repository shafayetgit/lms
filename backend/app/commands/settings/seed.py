import asyncio
import argparse
import json
import os
from pathlib import Path

from app.db.session import get_session_maker
from app.models.settings import LMSSettings
from app.repositories import settings as settings_repo


async def seed_settings_command(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file '{file_path}': {e}")
        return
    except Exception as e:
        print(f"Error reading file '{file_path}': {e}")
        return

    if not isinstance(data, dict):
        print("Error: Fixture file must contain a JSON object (dict) of settings.")
        return

    session_maker = get_session_maker()

    async with session_maker() as db:
        # get_settings auto-creates row with ID=1 if missing
        settings = await settings_repo.get_settings(db)

        allowed_fields = {c.key for c in LMSSettings.__table__.columns} - {"id", "created_at", "updated_at"}
        updated_fields = []

        for field, value in data.items():
            if field in allowed_fields:
                setattr(settings, field, value)
                updated_fields.append(field)
            else:
                print(f"Warning: Unknown field '{field}' — skipping.")

        await settings_repo.update_settings(db, settings)
        print(f"Settings seeded successfully. Updated fields: {', '.join(updated_fields)}")


def main():
    default_path = Path(__file__).parent / "data.json"

    parser = argparse.ArgumentParser(description="Seed LMS settings from a JSON fixture file.")
    parser.add_argument(
        "--file",
        default=str(default_path),
        help=f"Path to JSON fixture file (default: {default_path})",
    )
    # Allow individual field overrides via CLI flags
    parser.add_argument("--default-currency", default=None, help="Override default currency (e.g. BDT, USD)")
    parser.add_argument("--payment-gateway", default=None, help="Override payment gateway slug")
    parser.add_argument("--contact-email", default=None, help="Override contact us email")

    args = parser.parse_args()

    # Apply CLI overrides onto the fixture data
    async def run():
        if not os.path.exists(args.file):
            print(f"Error: File '{args.file}' does not exist.")
            return
        with open(args.file, "r", encoding="utf-8") as f:
            data = json.load(f)

        if args.default_currency:
            data["default_currency"] = args.default_currency
        if args.payment_gateway:
            data["payment_gateway"] = args.payment_gateway
        if args.contact_email:
            data["contact_us_email"] = args.contact_email

        session_maker = get_session_maker()
        async with session_maker() as db:
            settings = await settings_repo.get_settings(db)
            allowed_fields = {c.key for c in LMSSettings.__table__.columns} - {"id", "created_at", "updated_at"}
            updated_fields = []
            for field, value in data.items():
                if field in allowed_fields:
                    setattr(settings, field, value)
                    updated_fields.append(field)
                else:
                    print(f"Warning: Unknown field '{field}' — skipping.")
            await settings_repo.update_settings(db, settings)
            print(f"Settings seeded successfully.")
            print(f"Updated fields: {', '.join(updated_fields)}")

    asyncio.run(run())


if __name__ == "__main__":
    main()
