import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.course import Course
from app.models.category import Category
from app.models.enrollment import Enrollment, EnrollmentStatus

@pytest_asyncio.fixture
async def test_admin(db_session: AsyncSession):
    user = User(
        username=f"admin_{uuid.uuid4().hex}",
        email=f"admin_{uuid.uuid4().hex}@example.com",
        hashed_password="hashed",
        role="admin",
        is_active=True,
        first_name="Admin",
        last_name="User"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest_asyncio.fixture
async def test_student(db_session: AsyncSession):
    user = User(
        username=f"student_{uuid.uuid4().hex}",
        email=f"student_{uuid.uuid4().hex}@example.com",
        hashed_password="hashed",
        role="student",
        is_active=True,
        first_name="Student",
        last_name="User"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest_asyncio.fixture
async def test_course(db_session: AsyncSession, test_admin):
    category = Category(name=f"Cat-{uuid.uuid4().hex}", slug=f"cat-{uuid.uuid4().hex}")
    db_session.add(category)
    await db_session.commit()
    
    course = Course(
        title=f"Course-{uuid.uuid4().hex}",
        slug=f"course-{uuid.uuid4().hex}",
        instructors=[test_admin],
        category_id=category.id
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    return course

@pytest.mark.asyncio
async def test_create_enrollment(client: AsyncClient, test_admin, test_student, test_course):
    """Test creating an enrollment."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    payload = {
        "user_id": test_student.id,
        "course_id": test_course.id,
        "status": "active"
    }
    response = await client.post("/api/v1/enrollments/", json=payload)
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["user_id"] == test_student.id
    assert data["course_id"] == test_course.id
    assert data["status"] == "active"
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_duplicate_enrollment(client: AsyncClient, test_admin, test_student, test_course):
    """Test that a user cannot be enrolled in the same course twice."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    payload = {"user_id": test_student.id, "course_id": test_course.id}
    res1 = await client.post("/api/v1/enrollments/", json=payload)
    assert res1.status_code == 201
    
    res2 = await client.post("/api/v1/enrollments/", json=payload)
    assert res2.status_code == 400
    assert "already enrolled" in res2.json()["message"]
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_read_enrollments(client: AsyncClient, test_admin, test_student, test_course):
    """Test reading enrollments."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    # Create one
    await client.post("/api/v1/enrollments/", json={"user_id": test_student.id, "course_id": test_course.id})
    
    # Read by user
    response = await client.get(f"/api/v1/enrollments/user/{test_student.id}")
    assert response.status_code == 200
    assert len(response.json()["data"]) == 1
    
    # Read by course
    response = await client.get(f"/api/v1/enrollments/course/{test_course.id}")
    assert response.status_code == 200
    assert len(response.json()["data"]) == 1
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_security_access_denied_for_student(client: AsyncClient, test_student, test_course):
    """Test that a student cannot access enrollment management."""
    from app.api.deps import get_current_active_user
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    
    app.dependency_overrides[get_current_active_user] = lambda: test_student
    app.dependency_overrides.pop(get_admin_or_instructor, None) # Ensure real logic runs
    
    payload = {"user_id": test_student.id, "course_id": test_course.id}
    response = await client.post("/api/v1/enrollments/", json=payload)
    assert response.status_code == 403 
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_read_enrollments_by_course_public_id(client: AsyncClient, test_admin, test_student, test_course):
    """Test reading enrollments filtered by course public_id (as course_id parameter)."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin

    # Create one
    await client.post("/api/v1/enrollments/", json={"user_id": test_student.id, "course_id": test_course.id})

    # Read enrollments using course_id as public_id query param
    response = await client.get(f"/api/v1/enrollments/?course_id={test_course.public_id}")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) == 1
    assert data[0]["course"]["public_id"] == test_course.public_id

    app.dependency_overrides.clear()
