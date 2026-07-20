from app.models.permission import Permission
from app.repositories.base import BaseRepository


class PermissionRepository(BaseRepository[Permission]):
    pass


permission_repo = PermissionRepository(Permission)
