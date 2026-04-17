from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.models.question import Question, Choice

# Question CRUD
async def create_question(db: AsyncSession, question: Question) -> Question:
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question

async def get_question(db: AsyncSession, question_id: int) -> Optional[Question]:
    result = await db.execute(
        select(Question)
        .where(Question.id == question_id)
        .options(selectinload(Question.choices))
    )
    return result.scalars().first()

async def get_questions_by_quiz(db: AsyncSession, quiz_id: int) -> List[Question]:
    result = await db.execute(
        select(Question)
        .where(Question.quiz_id == quiz_id)
        .order_by(Question.order_index)
        .options(selectinload(Question.choices))
    )
    return result.scalars().all()

async def get_questions_by_course(db: AsyncSession, course_id: int) -> List[Question]:
    result = await db.execute(
        select(Question)
        .where(Question.course_id == course_id)
        .options(selectinload(Question.choices))
    )
    return result.scalars().all()

async def update_question(db: AsyncSession, db_question: Question, update_data: dict) -> Question:
    # Handle choices separately if they are provided in update_data
    choices_data = update_data.pop("choices", None)
    
    for key, value in update_data.items():
        setattr(db_question, key, value)
    
    if choices_data is not None:
        # Simplest way: delete old choices and add new ones (or more complex sync)
        # For simplicity in this module, we'll replace them if provided
        db_question.choices = [Choice(**choice_data) for choice_data in choices_data]
    
    await db.commit()
    await db.refresh(db_question)
    return db_question

async def delete_question(db: AsyncSession, question: Question) -> None:
    await db.delete(question)
    await db.commit()

# Choice CRUD
async def add_choices(db: AsyncSession, question_id: int, choices: List[Choice]) -> List[Choice]:
    for choice in choices:
        choice.question_id = question_id
        db.add(choice)
    await db.commit()
    return choices
