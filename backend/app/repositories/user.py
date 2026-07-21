from typing import Any, List
from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.user import User
from app.models.role import Role
from app.core.security import get_password_hash
from app.repositories.base import BaseRepository
from datetime import datetime


class UserRepository(BaseRepository[User]):

    async def get_by_id(self, db: AsyncSession, id: int) -> User | None:
        result = await db.execute(
            select(User).options(joinedload(User.roles), joinedload(User.feature_flags)).where(User.id == id)
        )
        return result.unique().scalars().first()

    async def get_by_public_id(self, db: AsyncSession, public_id: str) -> User | None:
        result = await db.execute(
            select(User).options(joinedload(User.roles), joinedload(User.feature_flags)).where(User.public_id == public_id)
        )
        return result.unique().scalars().first()

    async def get_by_email(self, db: AsyncSession, email: str) -> User | None:
        result = await db.execute(
            select(User).options(joinedload(User.roles), joinedload(User.feature_flags)).where(User.email == email)
        )
        return result.unique().scalars().first()

    async def get_by_username(self, db: AsyncSession, username: str) -> User | None:
        result = await db.execute(
            select(User).options(joinedload(User.roles), joinedload(User.feature_flags)).where(User.username == username)
        )
        return result.unique().scalars().first()

    async def sync_roles(self, db: AsyncSession, user: User, role_names: list[str] = None):
        if role_names is None:
            role_str = getattr(user, "_role_str", None)
            role_names = [role_str] if role_str else []

        if not role_names:
            return

        from sqlalchemy.orm import attributes
        state = attributes.instance_state(user)
        if state.key is not None and "roles" in state.unloaded:
            await db.refresh(user, ["roles"])

        db_roles = []
        for r_name in role_names:
            r_name = r_name.value if hasattr(r_name, "value") else r_name
            result = await db.execute(select(Role).where((Role.slug == r_name.lower()) | (Role.name == r_name)))
            role_obj = result.scalars().first()
            if not role_obj:
                role_obj = Role(name=r_name, slug=r_name.lower())
                db.add(role_obj)
                await db.flush()
            db_roles.append(role_obj)
        user.roles = db_roles

    async def _assign_feature_flags(self, db: AsyncSession, user: User, role_names: list[str]):
        from app.models.feature_flag import FeatureFlag
        flags_to_assign = set()
        
        if "student" in role_names:
            flags_to_assign.add(("Academy", "academy", "Enable Academy."))
            
        if any(r in role_names for r in ["admin", "instructor", "evaluator"]):
            flags_to_assign.add(("Academy", "academy", "Enable Academy."))
            flags_to_assign.add(("Settings", "settings", "Enable Settings."))
            flags_to_assign.add(("LMS", "lms", "Enable LMS."))

        if not flags_to_assign:
            return

        from sqlalchemy.orm import attributes
        state = attributes.instance_state(user)
        if state.key is not None and "feature_flags" in state.unloaded:
            await db.refresh(user, ["feature_flags"])

        for name, slug, desc in flags_to_assign:
            stmt = select(FeatureFlag).where(FeatureFlag.slug == slug)
            result = await db.execute(stmt)
            ff = result.scalars().first()
            if not ff:
                ff = FeatureFlag(name=name, slug=slug, description=desc)
                db.add(ff)
                await db.flush()

            if ff not in user.feature_flags:
                user.feature_flags.append(ff)

    async def _assign_lms_explorer_badge(self, db: AsyncSession, user: User):
        from app.models.badge import Badge, BadgeAssignment
        from app.models.notification import Notification

        stmt = select(Badge).where(Badge.title == "LMS Explorer")
        result = await db.execute(stmt)
        badge = result.scalars().first()
        if not badge:
            badge = Badge(
                title="LMS Explorer",
                description="Awarded to members who actively explore the LMS platform.",
                image="/images/badges/badge_lms_explorer_1784153087953.png",
                is_active=True,
                grant_only_once=True
            )
            db.add(badge)
            await db.flush()

        from sqlalchemy.orm import attributes
        state = attributes.instance_state(user)
        if state.key is not None and "badges" in state.unloaded:
            await db.refresh(user, ["badges"])

        already_assigned = any(ba.badge_id == badge.id for ba in user.badges)
        if not already_assigned:
            stmt_assign = select(BadgeAssignment).where(
                BadgeAssignment.member_id == user.id,
                BadgeAssignment.badge_id == badge.id
            )
            res_assign = await db.execute(stmt_assign)
            if not res_assign.scalars().first():
                assignment = BadgeAssignment(
                    badge_id=badge.id,
                    member_id=user.id,
                    assigned_by_id=None
                )
                db.add(assignment)
                await db.flush()

                # Notify user
                notification = Notification(
                    user_id=user.id,
                    title="New Badge Awarded",
                    message=f"You have been awarded the '{badge.title}' badge: {badge.description}" if badge.description else f"You have been awarded the '{badge.title}' badge.",
                    link="/academy/badges",
                    read=False
                )
                db.add(notification)
                await db.flush()

    async def create(self, db: AsyncSession, *, obj_in: dict[str, Any]) -> User:
        roles_list = obj_in.pop("roles", None)
        if not roles_list and "role" in obj_in:
            roles_list = [obj_in.pop("role")]

        user = User(**obj_in)
        await self.sync_roles(db, user, role_names=roles_list)
        db.add(user)
        await db.flush()

        role_names = [r.lower() for r in roles_list] if roles_list else []
        if not role_names and user.roles:
            role_names = [r.name.lower() for r in user.roles]

        await self._assign_feature_flags(db, user, role_names)
        if "student" in role_names:
            await self._assign_lms_explorer_badge(db, user)
        await db.flush()

        return user

    async def create_user(self, db: AsyncSession, user: User) -> User:
        await self.sync_roles(db, user)
        db.add(user)
        await db.commit()

        role_names = [r.name.lower() for r in user.roles]
        await self._assign_feature_flags(db, user, role_names)
        if "student" in role_names:
            await self._assign_lms_explorer_badge(db, user)
        await db.commit()

        return await self.get_by_id(db, user.id)

    async def create_user_from_schema(self, db: AsyncSession, user_data) -> User:
        hashed_password = get_password_hash(user_data.password)

        common_fields = {
            "username": user_data.username,
            "email": user_data.email,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "hashed_password": hashed_password,
            "is_active": user_data.is_active,
            "email_verified": user_data.email_verified,
            "preferred_language": user_data.preferred_language,
            "timezone": user_data.timezone,
            "two_factor_enabled": user_data.two_factor_enabled,
            "avatar": user_data.avatar,
            
            "phone_number": getattr(user_data, "phone_number", None),
            "date_of_birth": getattr(user_data, "date_of_birth", None),
            
            "qualification": getattr(user_data, "qualification", None),
            "specialization": getattr(user_data, "specialization", None),
            "bio": getattr(user_data, "bio", None),
        }

        roles_list = []
        if hasattr(user_data, "roles") and user_data.roles:
            roles_list = user_data.roles
        elif hasattr(user_data, "role") and user_data.role:
            roles_list = [user_data.role]
        else:
            roles_list = ["student"]

        roles_list = [r for r in roles_list if r]

        user = User(**common_fields)
        await self.sync_roles(db, user, role_names=roles_list)

        db.add(user)
        await db.commit()

        roles_lower = [r.lower() for r in roles_list]
        await self._assign_feature_flags(db, user, roles_lower)
        if "student" in roles_lower:
            await self._assign_lms_explorer_badge(db, user)
        await db.commit()

        return await self.get_by_id(db, user.id)

    async def update_user(self, db: AsyncSession, user: User) -> User:
        await self.sync_roles(db, user)
        role_names = [r.name.lower() for r in user.roles] if user.roles else []
        await self._assign_feature_flags(db, user, role_names)
        await db.commit()
        return await self.get_by_id(db, user.id)

    async def delete_user(self, db: AsyncSession, user: User):
        await db.delete(user)
        await db.commit()

    # Student-specific methods
    async def get_student_by_id(self, db: AsyncSession, student_id: int | str) -> User | None:
        if isinstance(student_id, int) or (isinstance(student_id, str) and student_id.isdigit()):
            cond = User.id == int(student_id)
        else:
            cond = User.public_id == str(student_id)
        result = await db.execute(
            select(User)
            .options(joinedload(User.roles), joinedload(User.feature_flags))
            .join(User.roles)
            .where(cond, Role.slug == "student")
        )
        return result.unique().scalars().first()

    async def get_student_by_username(self, db: AsyncSession, username: str) -> User | None:
        result = await db.execute(
            select(User)
            .options(joinedload(User.roles), joinedload(User.feature_flags))
            .join(User.roles)
            .where(User.username == username, Role.slug == "student")
        )
        return result.unique().scalars().first()

    async def get_students(
        self, db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> list[User]:
        result = await db.execute(
            select(User)
            .options(joinedload(User.roles), joinedload(User.feature_flags))
            .join(User.roles)
            .where(Role.slug == "student")
            .offset(skip)
            .limit(limit)
        )
        return result.unique().scalars().all()

    async def get_students_with_query(
        self, db: AsyncSession, query: Select | None = None, skip: int = 0, limit: int = 10
    ) -> list[User]:
        q = query if query is not None else select(User).join(User.roles).where(Role.slug == "student")
        q = q.options(joinedload(User.roles), joinedload(User.feature_flags))
        result = await db.execute(q.offset(skip).limit(limit))
        return result.unique().scalars().all()

    async def count_students(self, db: AsyncSession, query: Select | None = None) -> int:
        q = query if query is not None else select(User).join(User.roles).where(Role.slug == "student")
        return await db.scalar(select(func.count()).select_from(q.subquery()))

    # Instructor-specific methods
    async def get_instructor_by_id(self, db: AsyncSession, instructor_id: int) -> User | None:
        result = await db.execute(
            select(User)
            .options(joinedload(User.roles), joinedload(User.feature_flags))
            .join(User.roles)
            .where(User.id == instructor_id, Role.slug == "instructor")
        )
        return result.unique().scalars().first()

    async def get_instructor_by_username(self, db: AsyncSession, username: str) -> User | None:
        result = await db.execute(
            select(User)
            .options(joinedload(User.roles), joinedload(User.feature_flags))
            .join(User.roles)
            .where(User.username == username, Role.slug == "instructor")
        )
        return result.unique().scalars().first()

    async def get_instructors(
        self, db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> list[User]:
        result = await db.execute(
            select(User)
            .options(joinedload(User.roles), joinedload(User.feature_flags))
            .join(User.roles)
            .where(Role.slug == "instructor")
            .offset(skip)
            .limit(limit)
        )
        return result.unique().scalars().all()

    async def get_instructors_with_query(
        self, db: AsyncSession, query: Select | None = None, skip: int = 0, limit: int = 10
    ) -> list[User]:
        q = query if query is not None else select(User).join(User.roles).where(Role.slug == "instructor")
        q = q.options(joinedload(User.roles), joinedload(User.feature_flags))
        result = await db.execute(q.offset(skip).limit(limit))
        return result.unique().scalars().all()

    async def count_instructors(self, db: AsyncSession, query: Select | None = None) -> int:
        q = query if query is not None else select(User).join(User.roles).where(Role.slug == "instructor")
        return await db.scalar(select(func.count()).select_from(q.subquery()))

    async def get_instructor_choices(self, db: AsyncSession, query: Select | None = None) -> list[dict]:
        if query is not None:
            stmt = query
        else:
            stmt = select(
                User.public_id.label("value"),
                func.concat(User.first_name, " ", User.last_name).label("label"),
            ).join(User.roles).where(Role.slug == "instructor")

        result = await db.execute(stmt)
        return result.mappings().all()


user_repo = UserRepository(User)


# Backward compatibility functions
async def sync_user_roles(db: AsyncSession, user: User, role_names: list[str] = None):
    await user_repo.sync_roles(db, user, role_names)


async def create_user(db: AsyncSession, user: User) -> User:
    return await user_repo.create_user(db, user)


async def create_user_from_schema(db: AsyncSession, user_data) -> User:
    return await user_repo.create_user_from_schema(db, user_data)


async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    return await user_repo.get_by_id(db, user_id)


async def get_user_by_username(db: AsyncSession, username: str) -> User | None:
    return await user_repo.get_by_username(db, username)


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    return await user_repo.get_by_email(db, email)


async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[User]:
    return await user_repo.get_multi(db, skip=skip, limit=limit)


async def update_user(db: AsyncSession, user: User) -> User:
    return await user_repo.update_user(db, user)


async def delete_user(db: AsyncSession, user: User):
    await user_repo.delete_user(db, user)


async def get_user_by_public_id(db: AsyncSession, public_id: str) -> User | None:
    return await user_repo.get_by_public_id(db, public_id)


async def get_student_by_id(db: AsyncSession, student_id: int | str) -> User | None:
    return await user_repo.get_student_by_id(db, student_id)


async def get_student_by_username(db: AsyncSession, username: str) -> User | None:
    return await user_repo.get_student_by_username(db, username)


async def get_students(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[User]:
    return await user_repo.get_students(db, skip, limit)


async def get_students_with_query(
    db: AsyncSession, query: Select | None = None, skip: int = 0, limit: int = 10
) -> list[User]:
    return await user_repo.get_students_with_query(db, query, skip, limit)


async def count_students(db: AsyncSession, query: Select | None = None) -> int:
    return await user_repo.count_students(db, query)


async def get_instructor_by_id(db: AsyncSession, instructor_id: int) -> User | None:
    return await user_repo.get_instructor_by_id(db, instructor_id)


async def get_instructor_by_username(db: AsyncSession, username: str) -> User | None:
    return await user_repo.get_instructor_by_username(db, username)


async def get_instructors(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[User]:
    return await user_repo.get_instructors(db, skip, limit)


async def get_instructors_with_query(
    db: AsyncSession, query: Select | None = None, skip: int = 0, limit: int = 10
) -> list[User]:
    return await user_repo.get_instructors_with_query(db, query, skip, limit)


async def count_instructors(db: AsyncSession, query: Select | None = None) -> int:
    return await user_repo.count_instructors(db, query)


async def get_instructor_choices(
    db: AsyncSession, query: Select | None = None
) -> list[dict]:
    return await user_repo.get_instructor_choices(db, query)
