from app.models.role import UserRoleAssociation
from app.repositories.base import BaseRepository


class UserRoleAssignmentRepository(BaseRepository[UserRoleAssociation]):
    pass


user_role_repo = UserRoleAssignmentRepository(UserRoleAssociation)
