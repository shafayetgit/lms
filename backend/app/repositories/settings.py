from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.settings import LMSSettings

async def get_settings(db: AsyncSession) -> LMSSettings:
    query = select(LMSSettings).where(LMSSettings.id == 1)
    result = await db.execute(query)
    settings = result.scalar_one_or_none()
    
    if not settings:
        settings = LMSSettings(id=1)
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
        
    return settings

async def update_settings(db: AsyncSession, settings: LMSSettings) -> LMSSettings:
    await db.commit()
    await db.refresh(settings)
    return settings
