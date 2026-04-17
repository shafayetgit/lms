import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.course import Course, CourseLevel
from app.models.category import Category
from app.models.quiz import QuestionType

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

@pytest.mark.asyncio
async def test_quiz_lifecycle(client: AsyncClient, test_admin, test_course):
    """Test full quiz lifecycle: create quiz, add question, read, update, delete."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin

    try:
        # 1. Create Quiz
        quiz_payload = {
            "courseId": test_course.id,
            "title": "Module 1 Quiz",
            "description": "Test your knowledge",
            "timeLimit": 30,
            "passingScore": 80.0
        }
        res_q = await client.post("/api/v1/quizzes/", json=quiz_payload)
        assert res_q.status_code == 201
        quiz_id = res_q.json()["id"]

        # 2. Add Question
        question_payload = {
            "text": "What is Python?",
            "type": "multiple_choice",
            "points": 5,
            "choices": [
                {"text": "A snake", "isCorrect": False},
                {"text": "A language", "isCorrect": True}
            ]
        }
        res_qn = await client.post(f"/api/v1/quizzes/{quiz_id}/questions", json=question_payload)
        assert res_qn.status_code == 201

        # 3. Read Quiz Detail
        res_detail = await client.get(f"/api/v1/quizzes/{quiz_id}")
        assert res_detail.status_code == 200
        data = res_detail.json()
        assert data["title"] == "Module 1 Quiz"
        assert len(data["questions"]) == 1
        assert len(data["questions"][0]["choices"]) == 2

        # 4. Update Quiz
        res_upd = await client.patch(f"/api/v1/quizzes/{quiz_id}", json={"title": "Updated Quiz"})
        assert res_upd.status_code == 200
        assert res_upd.json()["title"] == "Updated Quiz"

        # 5. List Course Quizzes
        res_list = await client.get(f"/api/v1/quizzes/course/{test_course.id}")
        assert res_list.status_code == 200
        assert len(res_list.json()) >= 1

        # 6. Delete Quiz
        res_del = await client.delete(f"/api/v1/quizzes/{quiz_id}")
        assert res_del.status_code == 204
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_quiz_security(client: AsyncClient, test_course):
    """Test that unauthorized users cannot create quizzes."""
    from app.main import app
    from app.api.deps import get_admin_or_instructor
    # Force real auth by removing the test override
    if get_admin_or_instructor in app.dependency_overrides:
        del app.dependency_overrides[get_admin_or_instructor]

    payload = {"courseId": test_course.id, "title": "Unauthorized Quiz"}
    res = await client.post("/api/v1/quizzes/", json=payload)
    # Should be 401/403 because we didn't provide a token
    assert res.status_code in [401, 403]
