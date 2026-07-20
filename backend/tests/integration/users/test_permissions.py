import pytest
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete

from app.models.user import User
from app.models.role import Role
from app.models.role_profile import RoleProfile
from app.models.permission import Permission
from app.core.dependencies import has_permission, PermissionChecker
from app.core.security import get_password_hash


import pytest_asyncio


@pytest_asyncio.fixture(autouse=True)
async def cleanup_permissions_db(db_session: AsyncSession):
    # Clean up roles, role profiles, and permissions created in tests
    yield
    await db_session.execute(delete(Permission))
    await db_session.execute(delete(RoleProfile))
    await db_session.execute(delete(Role))
    await db_session.execute(delete(User).where(User.email.like("test_perm_%")))
    await db_session.commit()
    from app.caches.permission import invalidate_permission_cache
    await invalidate_permission_cache()


@pytest.mark.asyncio
async def test_superadmin_permission_bypass(db_session: AsyncSession):
    # 1. Create a superadmin user
    superadmin_role = Role(name="superadmin", slug="superadmin")
    db_session.add(superadmin_role)
    await db_session.flush()

    user = User(
        username="superadmin_test",
        email="test_perm_sa@example.com",
        first_name="Super",
        last_name="Admin",
        hashed_password=get_password_hash("Password123!"),
        is_active=True,
        roles=[superadmin_role]
    )
    db_session.add(user)
    await db_session.commit()

    # 2. Check permission for a resource without any permission record in db
    assert await has_permission(user, db_session, "secret_resource", "read") is True


@pytest.mark.asyncio
async def test_merged_role_permissions(db_session: AsyncSession):
    # 1. Create roles
    role_course = Role(name="CourseManager", slug="course_manager")
    role_lesson = Role(name="LessonManager", slug="lesson_manager")
    db_session.add_all([role_course, role_lesson])
    await db_session.flush()

    # 2. Add permissions to roles
    perm_course = Permission(
        role_id=role_course.id,
        resource="course",
        read=True,
        create=True
    )
    perm_lesson = Permission(
        role_id=role_lesson.id,
        resource="lesson",
        read=True,
        create=False,
        update=True
    )
    db_session.add_all([perm_course, perm_lesson])
    await db_session.flush()

    # 3. Create user with both roles
    user = User(
        username="manager_test",
        email="test_perm_manager@example.com",
        first_name="Manager",
        last_name="User",
        hashed_password=get_password_hash("Password123!"),
        is_active=True,
        roles=[role_course, role_lesson]
    )
    db_session.add(user)
    await db_session.commit()

    # 4. Check permissions (merged across both roles)
    assert await has_permission(user, db_session, "course", "create") is True
    assert await has_permission(user, db_session, "lesson", "update") is True
    assert await has_permission(user, db_session, "lesson", "create") is False


@pytest.mark.asyncio
async def test_role_profile_bundled_permissions(db_session: AsyncSession):
    # 1. Create roles
    role1 = Role(name="RoleOne", slug="role_one")
    role2 = Role(name="RoleTwo", slug="role_two")
    db_session.add_all([role1, role2])
    await db_session.flush()

    # 2. Create permissions
    perm1 = Permission(role_id=role1.id, resource="resource1", read=True)
    perm2 = Permission(role_id=role2.id, resource="resource2", create=True)
    db_session.add_all([perm1, perm2])
    await db_session.flush()

    # 3. Create RoleProfile and bundle roles
    profile = RoleProfile(
        name="StaffProfile",
        slug="staff_profile",
        description="Bundles RoleOne and RoleTwo",
        roles=[role1, role2]
    )
    db_session.add(profile)
    await db_session.flush()

    # 4. Create user and assign RoleProfile
    user = User(
        username="staff_test",
        email="test_perm_staff@example.com",
        first_name="Staff",
        last_name="User",
        hashed_password=get_password_hash("Password123!"),
        is_active=True,
        role_profiles=[profile]
    )
    db_session.add(user)
    await db_session.commit()

    # 5. Check permissions (merged via RoleProfile bundling)
    assert await has_permission(user, db_session, "resource1", "read") is True
    assert await has_permission(user, db_session, "resource2", "create") is True
    assert await has_permission(user, db_session, "resource1", "create") is False


@pytest.mark.asyncio
async def test_only_if_creator_permission(db_session: AsyncSession):
    # 1. Create role and conditional permission
    role = Role(name="ContentCreator", slug="content_creator")
    db_session.add(role)
    await db_session.flush()

    perm = Permission(
        role_id=role.id,
        resource="article",
        update=True,
        only_if_creator=True
    )
    db_session.add(perm)
    await db_session.flush()

    # 2. Create users
    creator = User(
        username="creator_test",
        email="test_perm_creator@example.com",
        first_name="Creator",
        last_name="User",
        hashed_password=get_password_hash("Password123!"),
        is_active=True,
        roles=[role]
    )
    other = User(
        username="other_test",
        email="test_perm_other@example.com",
        first_name="Other",
        last_name="User",
        hashed_password=get_password_hash("Password123!"),
        is_active=True,
        roles=[role]
    )
    db_session.add_all([creator, other])
    await db_session.commit()

    # 3. Check ownership-constrained permissions
    # Creator should be allowed
    assert await has_permission(creator, db_session, "article", "update", creator_id=creator.id) is True
    # Other user should be denied
    assert await has_permission(other, db_session, "article", "update", creator_id=creator.id) is False
    # Check if creator_id is omitted completely (denied)
    assert await has_permission(creator, db_session, "article", "update") is False


@pytest.mark.asyncio
async def test_permission_checker_dependency(db_session: AsyncSession):
    # 1. Setup role and permission
    role = Role(name="ReaderRole", slug="reader_role")
    db_session.add(role)
    await db_session.flush()

    perm = Permission(role_id=role.id, resource="document", read=True)
    db_session.add(perm)
    await db_session.flush()

    user = User(
        username="reader_test",
        email="test_perm_reader@example.com",
        first_name="Reader",
        last_name="User",
        hashed_password=get_password_hash("Password123!"),
        is_active=True,
        roles=[role]
    )
    db_session.add(user)
    await db_session.commit()

    # 2. Instantiate and call dependency
    checker_read = PermissionChecker(resource="document", action="read")
    checker_write = PermissionChecker(resource="document", action="create")

    # Should pass (returns user)
    checked_user = await checker_read(user=user, db=db_session)
    assert checked_user == user

    # Should raise HTTP 403 Forbidden
    with pytest.raises(HTTPException) as exc_info:
        await checker_write(user=user, db=db_session)
    assert exc_info.value.status_code == 403
