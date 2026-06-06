import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.quiz import Quiz
from app.api.deps import get_db

async def run():
    print("Testing DB...")
