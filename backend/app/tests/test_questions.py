import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.course import Course, CourseLevel
from app.models.category import Category
from app.models.quiz import Quiz
from app.models.question import QuestionType

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
async def test_category(db_session: AsyncSession):
    category = Category(name=f"Cat_{uuid.uuid4().hex[:4]}", slug=f"cat_{uuid.uuid4().hex[:4]}")
    db_session.add(category)
    await db_session.commit()
    await db_session.refresh(category)
    return category

@pytest_asyncio.fixture
async def test_course(db_session: AsyncSession, test_admin, test_category):
    course = Course(
        title="Test Course",
        slug=f"test-course-{uuid.uuid4().hex[:4]}",
        description="Description",
        instructor_id=test_admin.id,
        category_id=test_category.id,
        level=CourseLevel.beginner,
        price=10.0
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    return course

@pytest_asyncio.fixture
async def test_quiz(db_session: AsyncSession, test_course):
    quiz = Quiz(
        course_id=test_course.id,
        title="Test Quiz",
        passing_score=70.0
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
            "questionType": "mcq_single",
            "points": 2.0,
            "quizId": test_quiz.id,
            "courseId": test_course.id,
            "categoryId": test_category.id,
            "choices": [
                {"text": "London", "isCorrect": False},
                {"text": "Paris", "isCorrect": True}
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
        update_payload = {"text": "Updated text?", "points": 5.0}
        res_upd = await client.put(f"/api/v1/questions/{question_id}", json=update_payload)
        assert res_upd.status_code == 200
        assert res_upd.json()["text"] == "Updated text?"
        assert res_upd.json()["points"] == 5.0

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
            "questionType": "mcq_single",
            "choices": [
                {"text": "Wrong 1", "isCorrect": False},
                {"text": "Wrong 2", "isCorrect": False}
            ]
        }
        res = await client.post("/api/v1/questions/", json=payload)
        assert res.status_code == 400
        assert "at least one correct choice" in res.json()["message"]

        # Failing: too few choices
        payload = {
            "text": "Too few choices",
            "questionType": "mcq_single",
            "choices": [
                {"text": "Only one", "isCorrect": True}
            ]
        }
        res = await client.post("/api/v1/questions/", json=payload)
        assert res.status_code == 400
        assert "at least 2 choices" in res.json()["message"]
    finally:
        app.dependency_overrides.clear()
