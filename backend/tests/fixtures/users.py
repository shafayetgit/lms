import pytest_asyncio
import uuid
from app.models.user import User
from faker import Faker

fake = Faker()

@pytest_asyncio.fixture
async def test_instructor(db_session):
    """Create an instructor user with realistic mock data."""
    first_name = fake.first_name()
    last_name = fake.last_name()
    uid = uuid.uuid4().hex[:6]
    username = f"{first_name.lower()}.{last_name.lower()}_{uid}"
    email = f"{username}@elite.lms"

    user = User(
        username=username,
        email=email,
        hashed_password="hashed_password",
        role="instructor",
        is_active=True,
        first_name=first_name,
        last_name=last_name
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest_asyncio.fixture
async def test_student(db_session):
    """Create a student user with realistic mock data."""
    first_name = fake.first_name()
    last_name = fake.last_name()
    uid = uuid.uuid4().hex[:6]
    username = f"{first_name.lower()}.{last_name.lower()}_{uid}"
    email = f"{username}@elite.lms"

    user = User(
        username=username,
        email=email,
        hashed_password="hashed_password",
        role="student",
        is_active=True,
        first_name=first_name,
        last_name=last_name
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest_asyncio.fixture
async def test_admin(db_session):
    """Create an admin user with realistic mock data."""
    first_name = fake.first_name()
    last_name = fake.last_name()
    uid = uuid.uuid4().hex[:6]
    username = f"{first_name.lower()}.{last_name.lower()}_{uid}"
    email = f"{username}@elite.lms"

    user = User(
        username=username,
        email=email,
        hashed_password="hashed_password",
        role="admin",
        is_active=True,
        first_name=first_name,
        last_name=last_name
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user
