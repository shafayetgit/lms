from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_content import AIDraftQuiz, AISourceContent
from app.models.question import Choice, Question, QuestionType
from app.models.quiz import Quiz
from app.repositories.ai_content import ai_draft_quiz_repo, ai_source_content_repo
from app.schemas.ai_content import AIDraftQuizUpdateRequest, AIQuizConfirmationRequest
from app.tasks.ai_content import run_quiz_generation_task


class AIContentService:
    async def initiate_quiz_generation(
        self,
        db: AsyncSession,
        *,
        title: str,
        filename: str,
        file_base64: str,
        difficulty: str,
        num_questions: int,
        owner_id: int,
    ) -> AISourceContent:

        # Save source content
        source_in = {
            "title": title,
            "original_filename": filename,
            "raw_text": "",  # To be filled by Celery parsing
            "corrected_text": "",  # To be filled by Celery text correction
            "owner_id": owner_id,
            "status": "queued",
        }
        source_obj = await ai_source_content_repo.create(db, obj_in=source_in)
        await db.commit()

        # Dispatch the Celery background task
        task_result = run_quiz_generation_task.delay(
            source_content_id=source_obj.id,
            filename=filename,
            file_base64=file_base64,
            difficulty=difficulty,
            num_questions=num_questions,
        )

        source_obj.celery_task_id = task_result.id
        await db.commit()

        return source_obj

    async def get_source_content(
        self, db: AsyncSession, public_id: str
    ) -> AISourceContent | None:
        return await ai_source_content_repo.get_by_public_id(db, public_id)

    async def get_draft_quiz(
        self, db: AsyncSession, public_id: str
    ) -> AIDraftQuiz | None:
        return await ai_draft_quiz_repo.get_by_public_id(db, public_id)

    async def update_draft_quiz(
        self, db: AsyncSession, public_id: str, obj_in: AIDraftQuizUpdateRequest
    ) -> AIDraftQuiz | None:
        """
        Allows the teacher to make inline corrections to the draft quiz JSON data.
        """
        draft = await ai_draft_quiz_repo.get_by_public_id(db, public_id)
        if not draft:
            return None

        updated_draft = await ai_draft_quiz_repo.update(
            db, db_obj=draft, obj_in={"quiz_data": obj_in.quiz_data}
        )
        await db.commit()
        return updated_draft

    async def confirm_and_publish_quiz(
        self,
        db: AsyncSession,
        public_id: str,
        obj_in: AIQuizConfirmationRequest,
        owner_id: int,
    ) -> Quiz | None:
        """
        Step 5: Human confirms the quiz. Convert the draft data to standard LMS Quiz,
        Question, and Choice models and save them in a single transaction.
        """
        draft = await ai_draft_quiz_repo.get_by_public_id(db, public_id)
        if not draft or draft.status != "pending_review":
            return None

        quiz_data = draft.quiz_data

        # 1. Create standard LMS Quiz
        quiz_title = obj_in.title_override or quiz_data.get(
            "title", "AI Generated Quiz"
        )
        quiz_desc = obj_in.description_override or quiz_data.get("description", "")

        quiz_obj = Quiz(
            title=quiz_title, description=quiz_desc, owner_id=owner_id, is_active=True
        )
        db.add(quiz_obj)
        await db.flush()  # Generate quiz_obj.id

        # 2. Iterate and create Question and Choices
        for idx, q_data in enumerate(quiz_data.get("questions", [])):
            question_obj = Question(
                quiz_id=quiz_obj.id,
                text=q_data["question_text"],
                explanation=q_data.get("explanation"),
                question_type=QuestionType.MCQ_SINGLE,
                created_by_id=owner_id,
                order_index=idx,
                is_active=True,
                owner_id=owner_id,
            )
            db.add(question_obj)
            await db.flush()  # Generate question_obj.id

            # Create Choices
            for opt_text in q_data.get("options", []):
                is_correct = opt_text == q_data["correct_option"]
                choice_obj = Choice(
                    question_id=question_obj.id,
                    text=opt_text,
                    is_correct=is_correct,
                    owner_id=owner_id,
                )
                db.add(choice_obj)

        # 3. Update draft status
        draft.status = "confirmed"
        draft.confirmed_quiz_id = quiz_obj.id
        db.add(draft)

        await db.commit()
        return quiz_obj

    async def get_generation_status(
        self, db: AsyncSession, public_id: str
    ) -> dict[str, Any] | None:
        """
        Retrieves real-time status and gets draft quiz public ID if generation is completed.
        """
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload

        stmt = (
            select(AISourceContent)
            .where(AISourceContent.public_id == public_id)
            .options(selectinload(AISourceContent.draft_quizzes))
        )
        result = await db.execute(stmt)
        source = result.scalar_one_or_none()
        if not source:
            return None

        draft_quiz_public_id = None
        if source.draft_quizzes:
            draft_quiz_public_id = source.draft_quizzes[0].public_id

        return {
            "public_id": source.public_id,
            "status": source.status,
            "error_message": source.error_message,
            "celery_task_id": source.celery_task_id,
            "draft_quiz_public_id": draft_quiz_public_id,
            "created_at": source.created_at,
        }


# Instantiate service singleton
ai_content_service = AIContentService()
