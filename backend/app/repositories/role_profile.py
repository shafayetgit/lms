from app.models.role_profile import RoleProfile
from app.repositories.base import BaseRepository


class RoleProfileRepository(BaseRepository[RoleProfile]):
    pass


role_profile_repo = RoleProfileRepository(RoleProfile)
