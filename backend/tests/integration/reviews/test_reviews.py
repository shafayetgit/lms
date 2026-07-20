import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient
from app.models.user import User
from app.models.category import Category
from app.models.course import Course

@pytest_asyncio.fixture
async def test_student(db_session):
    """Create a student user."""
    user = User(
        username=f"student_{uuid.uuid4().hex[:8]}",
        email=f"student_{uuid.uuid4().hex[:8]}@example.com",
        hashed_password="hashed",
        role="student",
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
    category = Category(name=f"Cat-{uuid.uuid4().hex[:8]}", slug=f"cat-{uuid.uuid4().hex[:8]}")
    instructor = User(
        username=f"ins_{uuid.uuid4().hex[:8]}",
        email=f"ins_{uuid.uuid4().hex[:8]}@example.com",
        hashed_password="hashed",
        role="instructor",
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
        title=f"Course-{uuid.uuid4().hex[:8]}",
        slug=f"course-{uuid.uuid4().hex[:8]}",
        instructors=[instructor],
        category_id=category.id,
        course_price=10.0
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    return course

@pytest.mark.asyncio
async def test_create_review(client: AsyncClient, db_session, test_student, test_course):
    """Test creating a review."""
    from app.api.deps import get_current_active_user
    from app.main import app
    from app.models.enrollment import Enrollment
    
    # Enroll student
    enrollment = Enrollment(user_id=test_student.id, course_id=test_course.id)
    db_session.add(enrollment)
    await db_session.commit()

    app.dependency_overrides[get_current_active_user] = lambda: test_student
    
    response = await client.post(
        "/api/v1/reviews/",
        json={
            "course_public_id": test_course.public_id,
            "student_public_id": test_student.public_id,
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
async def test_create_duplicate_review(client: AsyncClient, db_session, test_student, test_course):
    """Test that a student cannot review the same course twice."""
    from app.api.deps import get_current_active_user
    from app.main import app
    from app.models.enrollment import Enrollment

    # Enroll student
    enrollment = Enrollment(user_id=test_student.id, course_id=test_course.id)
    db_session.add(enrollment)
    await db_session.commit()

    app.dependency_overrides[get_current_active_user] = lambda: test_student
    
    await client.post(
        "/api/v1/reviews/",
        json={"course_public_id": test_course.public_id, "student_public_id": test_student.public_id, "rating": 4}
    )
    
    resp = await client.post(
        "/api/v1/reviews/",
        json={"course_public_id": test_course.public_id, "student_public_id": test_student.public_id, "rating": 3}
    )
    assert resp.status_code == 400
    assert "already reviewed" in resp.json()["message"].lower()
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_get_reviews_by_course(client: AsyncClient, db_session, test_student, test_course):
    """Test listing reviews for a course."""
    from app.api.deps import get_current_active_user
    from app.main import app
    from app.models.enrollment import Enrollment

    # Enroll student
    enrollment = Enrollment(user_id=test_student.id, course_id=test_course.id)
    db_session.add(enrollment)
    await db_session.commit()

    app.dependency_overrides[get_current_active_user] = lambda: test_student
    
    await client.post(
        "/api/v1/reviews/",
        json={"course_public_id": test_course.public_id, "student_public_id": test_student.public_id, "rating": 4}
    )
    
    response = await client.get(f"/api/v1/reviews/course/{test_course.public_id}")
    assert response.status_code == 200
    assert len(response.json()) == 1
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_course_aggregation_stats(client: AsyncClient, db_session, test_course):
    """Test that Course aggregation stats are correctly computed."""
    admin_user = User(username="admin", email=f"admin_{uuid.uuid4().hex[:8]}@ex.com", role="admin", is_active=True, first_name="A", last_name="M", hashed_password="h")
    db_session.add(admin_user)
    await db_session.commit()
    await db_session.refresh(admin_user)

    from app.api.deps import get_admin_or_instructor, get_current_active_user
    from app.core.dependencies import get_current_user, get_optional_current_user
    from app.main import app
    from app.models.enrollment import Enrollment

    app.dependency_overrides[get_admin_or_instructor] = lambda: admin_user
    app.dependency_overrides[get_current_active_user] = lambda: admin_user
    app.dependency_overrides[get_current_user] = lambda: admin_user
    app.dependency_overrides[get_optional_current_user] = lambda: admin_user

    # 1. Check initial stats
    response = await client.get(f"/api/v1/courses/{test_course.public_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["avg_rating"] == 0.0
    assert data["total_reviews"] == 0
    
    # 2. Create multiple students and reviews
    for i in range(1, 4):
        student = User(
            username=f"s{i}_{uuid.uuid4().hex[:8]}",
            email=f"s{i}_{uuid.uuid4().hex[:8]}@example.com",
            hashed_password="h",
            role="student",
            is_active=True,
            first_name=f"S{i}",
            last_name="T"
        )
        db_session.add(student)
        await db_session.commit()
        await db_session.refresh(student)

        # Enroll student
        enrollment = Enrollment(user_id=student.id, course_id=test_course.id)
        db_session.add(enrollment)
        await db_session.commit()
        
        # Override auth
        from app.api.deps import get_current_active_user
        from app.main import app
        app.dependency_overrides[get_current_active_user] = lambda s=student: s
        
        rating = i + 1 # 2, 3, 4
        await client.post(
            "/api/v1/reviews/",
            json={"course_public_id": test_course.public_id, "student_public_id": student.public_id, "rating": rating}
        )
        app.dependency_overrides.clear()

    # 3. Verify final stats: average of (2,3,4) is 3.0, total is 3

    from app.api.deps import get_admin_or_instructor, get_current_active_user
    from app.core.dependencies import get_current_user, get_optional_current_user
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: admin_user
    app.dependency_overrides[get_current_active_user] = lambda: admin_user
    app.dependency_overrides[get_current_user] = lambda: admin_user
    app.dependency_overrides[get_optional_current_user] = lambda: admin_user
    
    response = await client.get(f"/api/v1/courses/{test_course.public_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["avg_rating"] == 3.0
    assert data["total_reviews"] == 3
    
    app.dependency_overrides.clear()
