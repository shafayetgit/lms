import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.category import Category
from app.models.enrollment import Enrollment, EnrollmentStatus

@pytest_asyncio.fixture
async def test_admin(db_session: AsyncSession):
    user = User(
        username=f"admin_{uuid.uuid4().hex[:4]}",
        email=f"admin_{uuid.uuid4().hex[:4]}@example.com",
        hashed_password="hashed",
        role=UserRole.ADMIN,
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
        username=f"student_{uuid.uuid4().hex[:4]}",
        email=f"student_{uuid.uuid4().hex[:4]}@example.com",
        hashed_password="hashed",
        role=UserRole.STUDENT,
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
    category = Category(name=f"Cat-{uuid.uuid4().hex[:4]}", slug=f"cat-{uuid.uuid4().hex[:4]}")
    db_session.add(category)
    await db_session.commit()
    
    course = Course(
        title=f"Course-{uuid.uuid4().hex[:4]}",
        slug=f"course-{uuid.uuid4().hex[:4]}",
        instructor_id=test_admin.id,
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
        "userId": test_student.id,
        "courseId": test_course.id,
        "status": "active"
    }
    response = await client.post("/api/v1/enrollments/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["userId"] == test_student.id
    assert data["courseId"] == test_course.id
    assert data["status"] == "active"
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_duplicate_enrollment(client: AsyncClient, test_admin, test_student, test_course):
    """Test that a user cannot be enrolled in the same course twice."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    payload = {"userId": test_student.id, "courseId": test_course.id}
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
    await client.post("/api/v1/enrollments/", json={"userId": test_student.id, "courseId": test_course.id})
    
    # Read by user
    response = await client.get(f"/api/v1/enrollments/user/{test_student.id}")
    assert response.status_code == 200
    assert len(response.json()) == 1
    
    # Read by course
    response = await client.get(f"/api/v1/enrollments/course/{test_course.id}")
    assert response.status_code == 200
    assert len(response.json()) == 1
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_security_access_denied_for_student(client: AsyncClient, test_student, test_course):
    """Test that a student cannot access enrollment management."""
    from app.api.deps import get_current_active_user
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    
    app.dependency_overrides[get_current_active_user] = lambda: test_student
    app.dependency_overrides.pop(get_admin_or_instructor, None) # Ensure real logic runs
    
    payload = {"userId": test_student.id, "courseId": test_course.id}
    response = await client.post("/api/v1/enrollments/", json=payload)
    assert response.status_code == 403 
    
    app.dependency_overrides.clear()
