import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.course import Course

@pytest_asyncio.fixture
async def test_student(db_session):
    """Create a student user."""
    user = User(
        username=f"student_{uuid.uuid4().hex[:4]}",
        email=f"student_{uuid.uuid4().hex[:4]}@example.com",
        hashed_password="hashed",
        role=UserRole.STUDENT,
        is_active=True,
        first_name="Test",
        last_name="Student"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest_asyncio.fixture
async def test_course(db_session):
    """Create a course for reviews."""
    category = Category(name=f"Cat-{uuid.uuid4().hex[:4]}", slug=f"cat-{uuid.uuid4().hex[:4]}")
    instructor = User(
        username=f"ins_{uuid.uuid4().hex[:4]}",
        email=f"ins_{uuid.uuid4().hex[:4]}@example.com",
        hashed_password="hashed",
        role=UserRole.INSTRUCTOR,
        is_active=True,
        first_name="Test",
        last_name="Instructor"
    )
    db_session.add(category)
    db_session.add(instructor)
    await db_session.commit()
    await db_session.refresh(category)
    await db_session.refresh(instructor)
    
    course = Course(
        title=f"Course-{uuid.uuid4().hex[:4]}",
        slug=f"course-{uuid.uuid4().hex[:4]}",
        instructor_id=instructor.id,
        category_id=category.id,
        price=10.0
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    return course

@pytest.mark.asyncio
async def test_create_review(client: AsyncClient, test_student, test_course):
    """Test creating a review."""
    from app.api.deps import get_current_active_user
    from app.main import app
    app.dependency_overrides[get_current_active_user] = lambda: test_student
    
    response = await client.post(
        "/api/v1/reviews/",
        json={
            "courseId": test_course.id,
            "studentId": test_student.id,
            "rating": 5,
            "body": "Excellent course!"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["rating"] == 5
    assert data["body"] == "Excellent course!"
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_create_duplicate_review(client: AsyncClient, test_student, test_course):
    """Test that a student cannot review the same course twice."""
    from app.api.deps import get_current_active_user
    from app.main import app
    app.dependency_overrides[get_current_active_user] = lambda: test_student
    
    await client.post(
        "/api/v1/reviews/",
        json={"courseId": test_course.id, "studentId": test_student.id, "rating": 4}
    )
    
    resp = await client.post(
        "/api/v1/reviews/",
        json={"courseId": test_course.id, "studentId": test_student.id, "rating": 3}
    )
    assert resp.status_code == 400
    assert "already reviewed" in resp.json()["message"].lower()
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_get_reviews_by_course(client: AsyncClient, test_student, test_course):
    """Test listing reviews for a course."""
    from app.api.deps import get_current_active_user
    from app.main import app
    app.dependency_overrides[get_current_active_user] = lambda: test_student
    
    await client.post(
        "/api/v1/reviews/",
        json={"courseId": test_course.id, "studentId": test_student.id, "rating": 4}
    )
    
    response = await client.get(f"/api/v1/reviews/course/{test_course.id}")
    assert response.status_code == 200
    assert len(response.json()) == 1
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_course_aggregation_stats(client: AsyncClient, db_session, test_course):
    """Test that Course aggregation stats are correctly computed."""
    # 1. Check initial stats
    response = await client.get(f"/api/v1/courses/{test_course.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["avgRating"] == 0.0
    assert data["totalReviews"] == 0
    
    # 2. Create multiple students and reviews
    for i in range(1, 4):
        student = User(
            username=f"s{i}_{uuid.uuid4().hex[:4]}",
            email=f"s{i}_{uuid.uuid4().hex[:4]}@example.com",
            hashed_password="h",
            role=UserRole.STUDENT,
            is_active=True,
            first_name=f"S{i}",
            last_name="T"
        )
        db_session.add(student)
        await db_session.commit()
        await db_session.refresh(student)
        
        # Override auth
        from app.api.deps import get_current_active_user
        from app.main import app
        app.dependency_overrides[get_current_active_user] = lambda s=student: s
        
        rating = i + 1 # 2, 3, 4
        await client.post(
            "/api/v1/reviews/",
            json={"courseId": test_course.id, "studentId": student.id, "rating": rating}
        )
        app.dependency_overrides.clear()

    # 3. Verify final stats: average of (2,3,4) is 3.0, total is 3
    admin_user = User(username="admin_stats", email="admin_stats@ex.com", role=UserRole.ADMIN, is_active=True, first_name="A", last_name="M", hashed_password="h")
    from app.api.deps import get_admin_or_instructor, get_current_active_user
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: admin_user
    app.dependency_overrides[get_current_active_user] = lambda: admin_user
    
    response = await client.get(f"/api/v1/courses/{test_course.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["avgRating"] == 3.0
    assert data["totalReviews"] == 3
    
    app.dependency_overrides.clear()
