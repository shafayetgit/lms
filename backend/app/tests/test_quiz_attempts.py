import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.user import User, UserRole, Instructor
from app.models.course import Course, CourseLevel
from app.models.category import Category
from app.models.quiz import Quiz
from app.models.question import Question, Choice, QuestionType

@pytest.mark.asyncio
async def test_quiz_attempt_lifecycle(client: AsyncClient, db_session: AsyncSession):
    """Test full quiz attempt lifecycle: start, submit, results."""
    # Setup unique names
    uid = uuid.uuid4().hex[:6]
    student_name = f"stu_{uid}"
    inst_name = f"inst_{uid}"

    # Setup Instructor
    instructor = Instructor(
        username=inst_name,
        email=f"{inst_name}@example.com",
        first_name="Test",
        last_name="Instructor",
        role=UserRole.INSTRUCTOR,
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
        role=UserRole.STUDENT,
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
        instructor_id=instructor.id, 
        category_id=cat.id, 
        price=0
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    
    quiz = Quiz(course_id=course.id, title="Test Quiz", passing_score=50.0)
    db_session.add(quiz)
    await db_session.commit()
    await db_session.refresh(quiz)
    
    # Q1: MCQ (2 points)
    q1 = Question(quiz_id=quiz.id, text="Q1", question_type=QuestionType.MCQ_SINGLE, points=2.0, created_by_id=instructor.id)
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
    q2 = Question(quiz_id=quiz.id, text="Q2", question_type=QuestionType.SHORT_ANSWER, points=3.0, created_by_id=instructor.id)
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
        start_payload = {"quizId": quiz.id}
        res_start = await client.post("/api/v1/quiz-attempts/", json=start_payload)
        assert res_start.status_code == 201
        attempt_id = res_start.json()["id"]

        # 2. Submit Answers
        # Fetch q1 with choices to get real IDs
        res = await db_session.execute(
            select(Question).where(Question.id == q1.id).options(selectinload(Question.choices))
        )
        q1_fetched = res.scalar_one()
        c1_correct = next(c for c in q1_fetched.choices if c.is_correct)
        
        submit_payload = {
            "answers": [
                {"questionId": q1.id, "choiceId": c1_correct.id},
                {"questionId": q2.id, "answerText": "Answer"}
            ]
        }
        res_submit = await client.post(f"/api/v1/quiz-attempts/{attempt_id}/submit", json=submit_payload)
        assert res_submit.status_code == 200
        data = res_submit.json()
        assert data["score"] == 5.0 # 2 + 3
        assert data["percentage"] == 100.0
        assert data["isPassed"] is True
        assert data["status"] == "completed"

        # 3. Read Attempt Detail
        res_detail = await client.get(f"/api/v1/quiz-attempts/{attempt_id}")
        assert res_detail.status_code == 200
        detail = res_detail.json()
        assert len(detail["answers"]) == 2
        assert detail["answers"][0]["isCorrect"] is True
        
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_smoke_user(db_session: AsyncSession):
    user = User(username="smoke", email="smoke@example.com", hashed_password="pw")
    db_session.add(user)
    await db_session.commit()
    assert user.id is not None
