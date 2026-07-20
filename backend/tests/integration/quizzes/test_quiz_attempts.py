import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.user import User
from app.models.course import Course
from app.models.category import Category
from app.models.quiz import Quiz
from app.models.question import Question, Choice, QuestionType
import httpx

@pytest.mark.asyncio
async def test_quiz_submission_lifecycle(client: AsyncClient, db_session: AsyncSession):
    """Test full quiz attempt lifecycle: start, submit, results."""
    # Setup unique names
    uid = uuid.uuid4().hex[:6]
    student_name = f"stu_{uid}"
    inst_name = f"inst_{uid}"

    # Setup Instructor
    instructor = User(
        username=inst_name,
        email=f"{inst_name}@example.com",
        first_name="Test",
        last_name="Instructor",
        role="instructor",
        hashed_password="pw",
        qualification="PhD"
    )
    db_session.add(instructor)
    await db_session.commit()
    await db_session.refresh(instructor)
    print(f"DEBUG: Created instructor {instructor.id}")

    # Setup Student
    student = User(
        username=student_name,
        email=f"{student_name}@example.com",
        first_name="Test",
        last_name="Student",
        role="student",
        hashed_password="pw"
    )
    db_session.add(student)
    await db_session.commit()
    await db_session.refresh(student)

    # Setup Category/Course/Quiz
    cat = Category(name=f"Cat_{uid}", slug=f"cat-{uid}")
    db_session.add(cat)
    await db_session.commit()
    await db_session.refresh(cat)
    
    course = Course(
        title=f"Course_{uid}", 
        slug=f"course-{uid}", 
        category_id=cat.id, 
        course_price=0.0
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)

    from app.models.course_instructor import CourseInstructor
    ci = CourseInstructor(course_id=course.id, instructor_id=instructor.id)
    db_session.add(ci)
    await db_session.commit()
    
    quiz = Quiz(title="Test Quiz", passing_percentage=50.0)
    db_session.add(quiz)
    await db_session.commit()
    await db_session.refresh(quiz)
    
    # Q1: MCQ (2 points)
    q1 = Question(quiz_id=quiz.id, text="Q1", question_type=QuestionType.MCQ_SINGLE, marks=2.0, created_by_id=instructor.id)
    db_session.add(q1)
    await db_session.commit()
    await db_session.refresh(q1)
    c1_1 = Choice(question_id=q1.id, text="Correct", is_correct=True)
    c1_2 = Choice(question_id=q1.id, text="Wrong", is_correct=False)
    # Correctly link them so q1.choices is populated in memory
    q1.choices.extend([c1_1, c1_2])
    db_session.add_all([c1_1, c1_2])
    await db_session.commit()
    
    # Q2: Short Answer (3 points)
    q2 = Question(quiz_id=quiz.id, text="Q2", question_type=QuestionType.SHORT_ANSWER, marks=3.0, created_by_id=instructor.id)
    db_session.add(q2)
    await db_session.commit()
    await db_session.refresh(q2)
    c2 = Choice(question_id=q2.id, text="Answer", is_correct=True)
    q2.choices.append(c2)
    db_session.add(c2)
    await db_session.commit()

    from app.api.deps import get_current_active_user
    from app.main import app
    app.dependency_overrides[get_current_active_user] = lambda: student

    try:
        # 1. Start Attempt
        start_payload = {"quiz_id": quiz.id}
        res_start = await client.post("/api/v1/quiz-submissions/", json=start_payload)
        assert res_start.status_code == 201
        attempt_id = res_start.json()["data"]["id"]

        # 2. Submit Answers
        # Fetch q1 with choices to get real IDs
        res = await db_session.execute(
            select(Question).where(Question.id == q1.id).options(selectinload(Question.choices))
        )
        q1_fetched = res.scalar_one()
        c1_correct = next(c for c in q1_fetched.choices if c.is_correct)
        
        submit_payload = {
            "answers": [
                {"question_id": q1.id, "selected_option_id": c1_correct.id},
                {"question_id": q2.id, "answer_text": "Answer"}
            ]
        }
        res_submit = await client.post(f"/api/v1/quiz-submissions/{attempt_id}/submit", json=submit_payload)
        assert res_submit.status_code == 200
        data = res_submit.json()["data"]
        assert data["score"] == 5.0 # 2 + 3
        assert data["percentage"] == 100.0
        assert data["is_passed"] is True
        assert data["status"] == "completed"

        # 3. Read Attempt Detail
        res_detail = await client.get(f"/api/v1/quiz-submissions/{attempt_id}")
        assert res_detail.status_code == 200
        detail = res_detail.json()
        assert len(detail["answers"]) == 2
        assert detail["answers"][0]["is_correct"] is True
        
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_quiz_negative_marking(client: AsyncClient, db_session: AsyncSession):
    """Test quiz submission with negative marking enabled."""
    uid = uuid.uuid4().hex[:6]
    student_name = f"stu_{uid}"
    inst_name = f"inst_{uid}"

    # Setup Instructor
    instructor = User(
        username=inst_name,
        email=f"{inst_name}@example.com",
        first_name="Test",
        last_name="Instructor",
        role="instructor",
        hashed_password="pw"
    )
    db_session.add(instructor)
    await db_session.commit()

    # Setup Student
    student = User(
        username=student_name,
        email=f"{student_name}@example.com",
        first_name="Test",
        last_name="Student",
        role="student",
        hashed_password="pw"
    )
    db_session.add(student)
    await db_session.commit()

    quiz = Quiz(
        title="Negative Quiz", 
        passing_percentage=50.0, 
        enable_negative_marking=True, 
        marks_to_cut=0.5
    )
    db_session.add(quiz)
    await db_session.commit()
    await db_session.refresh(quiz)

    q1 = Question(quiz_id=quiz.id, text="Q1", question_type=QuestionType.MCQ_SINGLE, marks=2.0, created_by_id=instructor.id)
    db_session.add(q1)
    await db_session.commit()
    await db_session.refresh(q1)
    c1_correct = Choice(question_id=q1.id, text="Correct", is_correct=True)
    c1_wrong = Choice(question_id=q1.id, text="Wrong", is_correct=False)
    q1.choices.extend([c1_correct, c1_wrong])
    db_session.add_all([c1_correct, c1_wrong])
    await db_session.commit()

    from app.api.deps import get_current_active_user
    from app.main import app
    app.dependency_overrides[get_current_active_user] = lambda: student

    try:
        # Start Attempt
        res_start = await client.post("/api/v1/quiz-submissions/", json={"quiz_id": quiz.id})
        assert res_start.status_code == 201
        attempt_id = res_start.json()["data"]["id"]

        # Submit WRONG answer to trigger negative marking
        submit_payload = {
            "answers": [
                {"question_id": q1.id, "selected_option_id": c1_wrong.id}
            ]
        }
        res_submit = await client.post(f"/api/v1/quiz-submissions/{attempt_id}/submit", json=submit_payload)
        assert res_submit.status_code == 200
        data = res_submit.json()["data"]
        
        # We got it wrong, so total_score is capped at 0.0 (since 0 - 0.5 is negative)
        assert data["score"] == 0.0
        assert data["percentage"] == 0.0

        # Now check the specific answer result in detail (should show -0.5 marks)
        res_detail = await client.get(f"/api/v1/quiz-submissions/{attempt_id}")
        assert res_detail.status_code == 200
        detail = res_detail.json()
        assert len(detail["answers"]) == 1
        assert detail["answers"][0]["is_correct"] is False
        assert detail["answers"][0]["marks"] == -0.5

    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_smoke_user(db_session: AsyncSession):
    uid = uuid.uuid4().hex[:8]
    user = User(
        username=f"smoke_{uid}",
        email=f"smoke_{uid}@example.com",
        hashed_password="pw",
        first_name="Smoke",
        last_name="User"
    )
    db_session.add(user)
    await db_session.commit()
    assert user.id is not None
