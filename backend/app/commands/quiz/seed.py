import sys
import asyncio
import argparse
import json
import os
from pathlib import Path

# Add project root to sys.path for direct script execution
sys.path.append(str(Path(__file__).resolve().parents[3]))

from sqlalchemy.exc import IntegrityError
from sqlalchemy import select

from app.db.session import get_session_maker
from app.models.quiz import Quiz
from app.models.question import Question, QuestionType, Choice
from app.models.user import User


async def seed_quizzes_command(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            quizzes_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file '{file_path}': {e}")
        return
    except Exception as e:
        print(f"Error reading file '{file_path}': {e}")
        return

    if not isinstance(quizzes_data, list):
        print("Error: Fixture file must contain a JSON array (list) of quizzes.")
        return

    session_maker = get_session_maker()
    print(f"Starting seed process for {len(quizzes_data)} quizzes...\n")

    async with session_maker() as db:
        # Get first user as default creator
        user_res = await db.execute(select(User).order_by(User.id.asc()))
        admin_user = user_res.scalars().first()
        creator_id = admin_user.id if admin_user else 1

        for idx, quiz_info in enumerate(quizzes_data, 1):
            title = quiz_info.get("title")
            if not title:
                print(f"Warning: Skipping quiz at index {idx} because it is missing a title.")
                continue

            # Check if quiz with same title exists
            result = await db.execute(select(Quiz).where(Quiz.title == title))
            existing_quiz = result.scalars().first()

            if existing_quiz:
                print(f"Quiz '{title}' already exists (ID: {existing_quiz.id}). Skipping creation.")
                continue

            questions_data = quiz_info.get("questions", [])
            total_marks = sum(q.get("marks", 1.0) for q in questions_data)

            quiz = Quiz(
                title=title,
                description=quiz_info.get("description"),
                max_attempts=quiz_info.get("max_attempts", 1),
                show_answers=quiz_info.get("show_answers", True),
                show_submission_history=quiz_info.get("show_submission_history", True),
                total_marks=total_marks,
                passing_percentage=quiz_info.get("passing_percentage", 60.0),
                duration=quiz_info.get("duration", 30),
                shuffle_questions=quiz_info.get("shuffle_questions", False),
                limit_questions_to=quiz_info.get("limit_questions_to", 0),
                enable_negative_marking=quiz_info.get("enable_negative_marking", False),
                marks_to_cut=quiz_info.get("marks_to_cut", 0.0),
                is_active=quiz_info.get("is_active", True),
            )

            try:
                db.add(quiz)
                await db.flush()
                print(f"Created Quiz: '{quiz.title}' (ID: {quiz.id})")

                for q_idx, q_info in enumerate(questions_data, 1):
                    q_type_str = q_info.get("question_type", "mcq_single")
                    try:
                        q_type = QuestionType(q_type_str)
                    except ValueError:
                        q_type = QuestionType.MCQ_SINGLE

                    question = Question(
                        quiz_id=quiz.id,
                        created_by_id=creator_id,
                        text=q_info.get("text", f"Question {q_idx}"),
                        explanation=q_info.get("explanation"),
                        question_type=q_type,
                        marks=q_info.get("marks", 1.0),
                        order_index=q_info.get("order_index", q_idx),
                        is_active=q_info.get("is_active", True),
                    )
                    db.add(question)
                    await db.flush()

                    choices_data = q_info.get("choices", [])
                    for choice_info in choices_data:
                        choice = Choice(
                            question_id=question.id,
                            text=choice_info.get("text"),
                            is_correct=choice_info.get("is_correct", False),
                            explanation=choice_info.get("explanation"),
                        )
                        db.add(choice)

                await db.commit()
                print(f"  └─ Added {len(questions_data)} questions to quiz '{quiz.title}'.")
            except IntegrityError as e:
                await db.rollback()
                print(f"Database Integrity Error creating quiz '{title}': {e}")
            except Exception as e:
                await db.rollback()
                print(f"Error creating quiz '{title}': {e}")

    print("\nQuiz seed process completed successfully!")


def main():
    default_path = Path(__file__).parent / "data.json"

    parser = argparse.ArgumentParser(description="Seed database with quizzes from a JSON fixture file.")
    parser.add_argument(
        "--file",
        default=str(default_path),
        help=f"Path to JSON fixtures file (default: {default_path})",
    )

    args = parser.parse_args()
    asyncio.run(seed_quizzes_command(args.file))


if __name__ == "__main__":
    main()
