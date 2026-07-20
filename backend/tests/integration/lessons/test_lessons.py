import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient
from app.models.user import User
from app.models.category import Category
from app.models.course import Course
from app.models.chapter import Chapter

@pytest_asyncio.fixture
async def test_admin(db_session):
    """Create a test admin user."""
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
async def test_chapter(db_session):
    """Create a course and chapter."""
    category = Category(name=f"Cat-{uuid.uuid4().hex}", slug=f"cat-{uuid.uuid4().hex}")
    instructor = User(
        username=f"ins_{uuid.uuid4().hex}",
        email=f"ins_{uuid.uuid4().hex}@example.com",
        hashed_password="hashed",
        role="instructor",
        is_active=True,
        first_name="I", last_name="N"
    )
    db_session.add(category)
    db_session.add(instructor)
    await db_session.commit()
    
    course = Course(title=f"C-{uuid.uuid4().hex}", slug=f"c-{uuid.uuid4().hex}", instructors=[instructor], category_id=category.id)
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    
    chapter = Chapter(course_id=course.id, title="Module 1", order_index=1)
    db_session.add(chapter)
    await db_session.commit()
    await db_session.refresh(chapter)
    return chapter

@pytest.mark.asyncio
async def test_create_lesson(client: AsyncClient, test_admin, test_chapter):
    """Test creating a lesson."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    title = f"Intro-{uuid.uuid4().hex}"
    response = await client.post(
        "/api/v1/lessons/",
        json={
            "chapter_id": test_chapter.id,
            "course_id": test_chapter.course_id,
            "title": title,
            "content": "Welcome!",
            "order_index": 1
        }
    )
    if response.status_code != 201:
        print(f"Error: {response.json()}")
    assert response.status_code == 201
    data = response.json()
    assert data["success"] == True
    assert "slug" not in data # because create_response doesn't return the full object anymore
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_create_duplicate_order_lesson(client: AsyncClient, test_admin, test_chapter):
    """Test duplicate order prevention."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    await client.post("/api/v1/lessons/", json={"chapter_id": test_chapter.id, "course_id": test_chapter.course_id, "title": "L1", "order_index": 1})
    
    response = await client.post("/api/v1/lessons/", json={"chapter_id": test_chapter.id, "course_id": test_chapter.course_id, "title": "L2", "order_index": 1})
    assert response.status_code == 400
    assert "already exists" in response.json()["message"].lower()
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_get_lessons_by_chapter(client: AsyncClient, test_admin, test_chapter):
    """Test listing lessons for a chapter."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    await client.post("/api/v1/lessons/", json={"chapter_id": test_chapter.id, "course_id": test_chapter.course_id, "title": f"L2-{uuid.uuid4().hex}", "order_index": 2})
    await client.post("/api/v1/lessons/", json={"chapter_id": test_chapter.id, "course_id": test_chapter.course_id, "title": f"L1-{uuid.uuid4().hex}", "order_index": 1})
    
    response = await client.get(f"/api/v1/lessons/chapter/{test_chapter.public_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    items = data["data"]
    assert len(items) == 2
    assert items[0]["order_index"] == 1
    assert items[1]["order_index"] == 2
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_read_lesson_detail(client: AsyncClient, test_admin, test_chapter, db_session):
    """Test retrieving a single lesson by ID."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    from app.models.lesson import Lesson
    lesson = Lesson(
        chapter_id=test_chapter.id,
        course_id=test_chapter.course_id,
        title="Details Lesson",
        slug="details-lesson",
        lesson_type="content",
        order_index=5,
        content="Details Content"
    )
    db_session.add(lesson)
    await db_session.commit()
    await db_session.refresh(lesson)

    response = await client.get(f"/api/v1/lessons/{lesson.public_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["title"] == "Details Lesson"
    assert data["data"]["content"] == "Details Content"
    assert data["data"]["id"] == lesson.id

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_duplicate_assignment_or_quiz_linkage(client: AsyncClient, test_admin, test_chapter, db_session):
    """Test that assigning the same assignment or quiz to multiple lessons fails."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    from app.models.assignment import Assignment, AssignmentType
    from app.models.quiz import Quiz
    
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    try:
        # Create a test assignment
        assignment = Assignment(
            title="Test Assignment",
            type=AssignmentType.TEXT,
            question="Question 1",
            course_id=test_chapter.course_id
        )
        # Create a test quiz
        quiz = Quiz(
            title="Test Quiz"
        )
        db_session.add(assignment)
        db_session.add(quiz)
        await db_session.commit()
        await db_session.refresh(assignment)
        await db_session.refresh(quiz)

        # 1. Create a lesson with the assignment
        res1 = await client.post(
            "/api/v1/lessons/",
            json={
                "chapter_id": test_chapter.id,
                "course_id": test_chapter.course_id,
                "title": "Lesson 1",
                "lesson_type": "assignment",
                "assignment_id": assignment.id,
                "order_index": 1
            }
        )
        assert res1.status_code == 201
        
        # 2. Attempt to create another lesson with the same assignment (should fail)
        res2 = await client.post(
            "/api/v1/lessons/",
            json={
                "chapter_id": test_chapter.id,
                "course_id": test_chapter.course_id,
                "title": "Lesson 2",
                "lesson_type": "assignment",
                "assignment_id": assignment.id,
                "order_index": 2
            }
        )
        assert res2.status_code == 400
        assert "already assigned" in res2.json()["message"]

        # 3. Create a lesson with the quiz
        res3 = await client.post(
            "/api/v1/lessons/",
            json={
                "chapter_id": test_chapter.id,
                "course_id": test_chapter.course_id,
                "title": "Lesson 3",
                "lesson_type": "quiz",
                "quiz_id": quiz.id,
                "order_index": 3
            }
        )
        assert res3.status_code == 201

        # 4. Attempt to create another lesson with the same quiz (should fail)
        res4 = await client.post(
            "/api/v1/lessons/",
            json={
                "chapter_id": test_chapter.id,
                "course_id": test_chapter.course_id,
                "title": "Lesson 4",
                "lesson_type": "quiz",
                "quiz_id": quiz.id,
                "order_index": 4
            }
        )
        assert res4.status_code == 400
        assert "already assigned" in res4.json()["message"]

    finally:
        app.dependency_overrides.clear()

