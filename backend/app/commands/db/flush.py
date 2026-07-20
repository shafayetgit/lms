import asyncio
from app.db.session import get_engine
from app.db.base import Base

# Import all models to ensure metadata is fully loaded
from app.models import (
    user, category, course, review, wishlist, chapter, lesson,
    course_progress, discussion, comment, enrollment, quiz,
    question, media, quiz_submission, badge, certificate,
    batch, program, assignment, email_template, email_account,
    invitation, settings, payment, payment_gateway, tracking,
    role, role_profile, feature_flag, notification
)


from sqlalchemy import text

async def flush_db_command():
    engine = get_engine()
    async with engine.begin() as conn:
        print("Dropping all tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Dropping alembic_version table...")
        await conn.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE"))
        print("Recreating all tables...")
        await conn.run_sync(Base.metadata.create_all)
    print("Database schema flushed and recreated successfully.")


def register_db_commands(subparsers):
    subparsers.add_parser("flushdb", help="Flush and recreate all database tables")


def handle_db_commands(args) -> bool:
    if args.command == "flushdb":
        asyncio.run(flush_db_command())
        return True
    return False
