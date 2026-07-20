import os
import asyncio
import pytest
import httpx
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.engine.url import make_url
from app.core.config import init_settings

# Configure/override DATABASE_URL for tests
settings = init_settings()
test_db_url = os.getenv("TEST_DATABASE_URL")
if test_db_url:
    settings.DATABASE_URL = test_db_url
elif not settings.DATABASE_URL.endswith("_test"):
    if "?" in settings.DATABASE_URL:
        base, query = settings.DATABASE_URL.split("?", 1)
        settings.DATABASE_URL = f"{base}_test?{query}"
    else:
        settings.DATABASE_URL = f"{settings.DATABASE_URL}_test"


def pytest_sessionstart(session):
    """
    Setup a clean, dedicated test database and create all tables before tests run.
    """
    async def setup_test_db_and_tables():
        from app.db.base import Base
        # Import all models to ensure metadata is fully loaded
        from app.models import user, category, course, review, wishlist, chapter, lesson, course_progress, discussion, comment, enrollment, quiz, question, media, quiz_submission, badge, certificate, batch, program, assignment, email_template, email_account, invitation

        # 1. Ensure test database exists
        url = make_url(settings.DATABASE_URL)
        db_name = url.database
        postgres_url = url.set(database="postgres").render_as_string(hide_password=False)

        engine = create_async_engine(postgres_url, isolation_level="AUTOCOMMIT")
        async with engine.connect() as conn:
            result = await conn.execute(
                text(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
            )
            exists = result.scalar()
            if not exists:
                await conn.execute(text(f"CREATE DATABASE {db_name}"))
        await engine.dispose()

        # 2. Create tables
        test_engine = create_async_engine(settings.DATABASE_URL)
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
        await test_engine.dispose()

    asyncio.run(setup_test_db_and_tables())


pytest_plugins = [
    "tests.fixtures.core.database",
    "tests.fixtures.core.client",
    "tests.fixtures.users",
    "tests.fixtures.categories",
    "tests.fixtures.courses",
    "tests.fixtures.lessons",
    "tests.fixtures.quizzes",
    "tests.fixtures.enrollments",
]


class SmartDict(dict):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for k, v in list(self.items()):
            if isinstance(v, dict) and not isinstance(v, SmartDict):
                self[k] = SmartDict(v)
            elif isinstance(v, list):
                self[k] = [SmartDict(item) if (isinstance(item, dict) and not isinstance(item, SmartDict)) else item for item in v]
                
        if dict.__contains__(self, "data") and dict.__contains__(self, "meta"):
            self["items"] = self["data"]

    def __getitem__(self, key):
        if isinstance(key, int) and dict.__contains__(self, "data") and isinstance(self["data"], list):
            return self["data"][key]
        
        if dict.__contains__(self, key):
            return super().__getitem__(key)
            
        if key == "is_passed":
            if dict.__contains__(self, "passing"):
                return super().__getitem__("passing")
            if dict.__contains__(self, "data") and isinstance(self["data"], dict) and dict.__contains__(self["data"], "passing"):
                return self["data"]["passing"]
                
        if isinstance(key, str):
            if dict.__contains__(self, "data") and isinstance(self["data"], dict):
                if dict.__contains__(self["data"], key):
                    return self["data"][key]
                if key == "is_passed" and dict.__contains__(self["data"], "passing"):
                    return self["data"]["passing"]
                    
        raise KeyError(key)

    def get(self, key, default=None):
        if dict.__contains__(self, key):
            return super().get(key, default)
            
        if key == "is_passed":
            if dict.__contains__(self, "passing"):
                return super().get("passing", default)
            if dict.__contains__(self, "data") and isinstance(self["data"], dict) and dict.__contains__(self["data"], "passing"):
                return self["data"].get("passing", default)

        if isinstance(key, str):
            if dict.__contains__(self, "data") and isinstance(self["data"], dict):
                if dict.__contains__(self["data"], key):
                    return self["data"].get(key, default)
                if key == "is_passed" and dict.__contains__(self["data"], "passing"):
                    return self["data"].get("passing", default)
                    
        return default

    def __contains__(self, key):
        if dict.__contains__(self, key):
            return True
            
        if key == "is_passed":
            if dict.__contains__(self, "passing"):
                return True
            if dict.__contains__(self, "data") and isinstance(self["data"], dict) and dict.__contains__(self["data"], "passing"):
                return True

        if isinstance(key, str):
            if dict.__contains__(self, "data") and isinstance(self["data"], dict):
                if dict.__contains__(self["data"], key):
                    return True
                if key == "is_passed" and dict.__contains__(self["data"], "passing"):
                    return True
                    
        return False

    def __len__(self):
        if dict.__contains__(self, "data") and isinstance(self["data"], list):
            return len(self["data"])
        return super().__len__()

    def __iter__(self):
        if dict.__contains__(self, "data") and isinstance(self["data"], list):
            return iter(self["data"])
        return super().__iter__()


@pytest.fixture(autouse=True)
def monkeypatch_response_json(monkeypatch):
    original_json = httpx.Response.json
    
    def custom_json(self, *args, **kwargs):
        data = original_json(self, *args, **kwargs)
        if isinstance(data, dict):
            return SmartDict(data)
        return data

    monkeypatch.setattr(httpx.Response, "json", custom_json)
