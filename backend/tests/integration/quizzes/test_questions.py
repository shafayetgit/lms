import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.course import Course
from app.models.category import Category
from app.models.quiz import Quiz
from app.models.question import QuestionType
import httpx

@pytest_asyncio.fixture
async def test_admin(db_session: AsyncSession):
    user = User(
        username=f"admin_{uuid.uuid4().hex[:8]}",
        email=f"admin_{uuid.uuid4().hex[:8]}@example.com",
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
async def test_category(db_session: AsyncSession):
    category = Category(name=f"Cat_{uuid.uuid4().hex[:8]}", slug=f"cat_{uuid.uuid4().hex[:8]}")
    db_session.add(category)
    await db_session.commit()
    await db_session.refresh(category)
    return category

@pytest_asyncio.fixture
async def test_course(db_session: AsyncSession, test_admin, test_category):
    course = Course(
        title="Test Course",
        slug=f"test-course-{uuid.uuid4().hex[:8]}",
        overview="Description",
        category_id=test_category.id,
        course_price=10.0
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)

    from app.models.course_instructor import CourseInstructor
    ci = CourseInstructor(course_id=course.id, instructor_id=test_admin.id)
    db_session.add(ci)
    await db_session.commit()
    return course

@pytest_asyncio.fixture
async def test_quiz(db_session: AsyncSession, test_course):
    quiz = Quiz(
        title="Test Quiz",
        passing_percentage=70.0
    )
    db_session.add(quiz)
    await db_session.commit()
    await db_session.refresh(quiz)
    return quiz

@pytest.mark.asyncio
async def test_question_crud(client: AsyncClient, test_admin, test_quiz, test_course, test_category):
    """Test full question CRUD and bank relations."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin

    try:
        # 1. Create Question (Bank + Quiz)
        question_payload = {
            "text": "What is the capital of France?",
            "question_type": "mcq_single",
            "marks": 2.0,
            "quiz_id": test_quiz.id,
            "course_id": test_course.id,
            "category_id": test_category.id,
            "choices": [
                {"text": "London", "is_correct": False},
                {"text": "Paris", "is_correct": True}
            ]
        }
        res = await client.post("/api/v1/questions/", json=question_payload)
        assert res.status_code == 201
        data = res.json()
        assert data["text"] == question_payload["text"]
        assert len(data["choices"]) == 2
        question_id = data["id"]

        # 2. Read Question
        res_read = await client.get(f"/api/v1/questions/{question_id}")
        assert res_read.status_code == 200
        assert res_read.json()["text"] == question_payload["text"]

        # 3. Update Question
        update_payload = {"text": "Updated text?", "marks": 5.0}
        res_upd = await client.put(f"/api/v1/questions/{question_id}", json=update_payload)
        assert res_upd.status_code == 200
        assert res_upd.json()["text"] == "Updated text?"
        assert res_upd.json()["marks"] == 5.0

        # 4. Filter by Quiz
        res_quiz = await client.get(f"/api/v1/questions/quiz/{test_quiz.id}")
        assert res_quiz.status_code == 200
        assert len(res_quiz.json()) >= 1

        # 5. Delete Question
        res_del = await client.delete(f"/api/v1/questions/{question_id}")
        assert res_del.status_code == 204
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_question_validation(client: AsyncClient, test_admin):
    """Test validation logic (at least 2 choices, at least 1 correct)."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin

    try:
        # Failing: no correct choice
        payload = {
            "text": "Invalid question",
            "question_type": "mcq_single",
            "choices": [
                {"text": "Wrong 1", "is_correct": False},
                {"text": "Wrong 2", "is_correct": False}
            ]
        }
        res = await client.post("/api/v1/questions/", json=payload)
        assert res.status_code == 400
        assert "at least one correct choice" in res.json()["message"]

        # Failing: too few choices
        payload = {
            "text": "Too few choices",
            "question_type": "mcq_single",
            "choices": [
                {"text": "Only one", "is_correct": True}
            ]
        }
        res = await client.post("/api/v1/questions/", json=payload)
        assert res.status_code == 400
        assert "at least 2 choices" in res.json()["message"]
    finally:
        app.dependency_overrides.clear()
