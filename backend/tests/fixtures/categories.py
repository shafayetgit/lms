import pytest_asyncio
import uuid
from app.models.category import Category
from faker import Faker
import re

fake = Faker()

@pytest_asyncio.fixture
async def test_category(db_session):
    """Create a category to use in tests with realistic data."""
    word = fake.catch_phrase().split()[0].capitalize()
    domain = fake.job().split()[-1].capitalize()
    base_name = f"{word} {domain}"
    
    unique_name = f"{base_name} {uuid.uuid4().hex}"
    unique_slug = re.sub(r'[^a-z0-9]+', '-', unique_name.lower())

    category = Category(name=unique_name, slug=unique_slug)
    db_session.add(category)
    await db_session.commit()
    await db_session.refresh(category)
    return category
