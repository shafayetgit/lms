import pytest_asyncio
import uuid
from app.models.quiz import Quiz
from app.models.question import Question, QuestionType, Choice
from faker import Faker

fake = Faker()

@pytest_asyncio.fixture
async def test_quiz(db_session, test_course):
    """Create a quiz inside the test course."""
    quiz = Quiz(
        title=f"Quiz: {fake.catch_phrase()}",
        course_id=test_course.id,
        description=fake.paragraph(),
        duration=30,
        passing_percentage=80.0,
        max_attempts=3,
        is_active=True
    )
    db_session.add(quiz)
    await db_session.commit()
    await db_session.refresh(quiz)
    return quiz

@pytest_asyncio.fixture
async def test_question(db_session, test_quiz, test_instructor):
    """Create a question inside the test quiz."""
    question = Question(
        quiz_id=test_quiz.id,
        course_id=test_quiz.course_id,
        created_by_id=test_instructor.id,
        text=f"What is {fake.word()}?",
        question_type=QuestionType.MCQ_SINGLE,
        marks=10.0,
        order_index=1,
    )
    db_session.add(question)
    await db_session.commit()
    await db_session.refresh(question)

    choices = [
        Choice(question_id=question.id, text=fake.word(), is_correct=True),
        Choice(question_id=question.id, text=fake.word(), is_correct=False),
        Choice(question_id=question.id, text=fake.word(), is_correct=False),
        Choice(question_id=question.id, text=fake.word(), is_correct=False)
    ]
    db_session.add_all(choices)
    await db_session.commit()
    
    return question
