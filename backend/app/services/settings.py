from sqlalchemy.ext.asyncio import AsyncSession
from app.models.settings import LMSSettings
from app.schemas.settings import LMSSettingsUpdate
from app.repositories import settings as settings_repo

async def update_settings(db: AsyncSession, settings_in: LMSSettingsUpdate) -> LMSSettings:
    settings = await settings_repo.get_settings(db)
    
    update_data = settings_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
        
    return await settings_repo.update_settings(db, settings)
