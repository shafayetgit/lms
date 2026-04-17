from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from app.db.session import get_db
from app.core.dependencies import get_current_active_user, get_admin_or_instructor

# Re-export for convenience
get_current_active_user = get_current_active_user
get_admin_or_instructor = get_admin_or_instructor
