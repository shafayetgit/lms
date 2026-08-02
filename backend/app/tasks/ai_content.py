import asyncio
import base64
import logging
import uuid

from app.core.celery import celery_app

logger = logging.getLogger(__name__)


async def run_quiz_generation_pipeline(
    source_content_id: int,
    filename: str,
    file_base64: str,
    difficulty: str,
    num_questions: int,
):
    """
    Async workflow that performs parsing, correction, generation, and auditing.
    """
    from app.ai.workflows.quiz_pipeline import QuizGenerationPipeline
    from app.db.session import dispose_current_loop_engine, get_session_maker
    from app.repositories.ai_content import (
        ai_draft_quiz_repo,
        ai_source_content_repo,
    )

    trace_id = uuid.uuid4().hex[:12]
    logger.info(
        "[%s] Quiz generation pipeline started | source_content_id=%d",
        trace_id,
        source_content_id,
    )

    session_maker = get_session_maker()

    # Status helper using a fresh short-lived session so updates commit immediately
    async def update_status(status_str: str, error_msg: str | None = None):
        try:
            async with session_maker() as status_db:
                source = await ai_source_content_repo.get_by_id(
                    status_db, id=source_content_id
                )
                if source:
                    source.status = status_str
                    if error_msg is not None:
                        source.error_message = error_msg
                    status_db.add(source)
                    await status_db.commit()
        except Exception as ex:
            logger.error(
                "[%s] Failed to update status to %s: %s", trace_id, status_str, ex
            )

    async with session_maker() as db:
        try:
            # 1. Fetch the source content record
            source_obj = await ai_source_content_repo.get_by_id(
                db, id=source_content_id
            )
            if not source_obj:
                logger.error(
                    "[%s] Source content ID %d not found",
                    trace_id,
                    source_content_id,
                )
                return False

            # 2. Decode the file bytes from base64
            file_bytes = base64.b64decode(file_base64)

            # 3. Run the AI pipeline
            pipeline = QuizGenerationPipeline()
            (
                corrected_text_obj,
                quiz_output_obj,
                quality_report_obj,
                token_usage,
            ) = await pipeline.run(
                filename=filename,
                file_bytes=file_bytes,
                difficulty=difficulty,
                num_questions=num_questions,
                trace_id=trace_id,
                status_callback=update_status,
            )

            # 4. Save raw & corrected text back to the source content
            raw_text = getattr(pipeline, "raw_text", "")

            source_obj.raw_text = raw_text
            source_obj.corrected_text = corrected_text_obj.corrected_text
            source_obj.status = "completed"
            from app.ai.prompts.templates import PROMPT_VERSION

            source_obj.meta_info = {
                "trace_id": trace_id,
                "confidence_score": corrected_text_obj.confidence_score,
                "corrections_made": corrected_text_obj.corrections_made,
                "token_usage": token_usage,
                "prompt_version": PROMPT_VERSION,
            }
            db.add(source_obj)

            # 5. Save the generated draft quiz
            draft_in = {
                "source_content_id": source_obj.id,
                "difficulty": difficulty,
                "num_questions": num_questions,
                "quiz_data": quiz_output_obj.model_dump(),
                "quality_report": quality_report_obj.model_dump(),
                "status": "pending_review",
                "owner_id": source_obj.owner_id,
            }
            await ai_draft_quiz_repo.create(db, obj_in=draft_in)
            await db.commit()
            logger.info("[%s] Task completed successfully", trace_id)
            return True

        except Exception as e:
            logger.error("[%s] Pipeline failed: %s", trace_id, e, exc_info=True)
            await update_status("failed", error_msg=str(e))
            raise e
        finally:
            await dispose_current_loop_engine()


@celery_app.task(
    name="ai_content.generate_quiz_pipeline",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def run_quiz_generation_task(
    source_content_id: int,
    filename: str,
    file_base64: str,
    difficulty: str,
    num_questions: int,
):
    """
    Celery entrypoint task. Runs the async workflow inside the Celery event loop.
    """
    try:
        loop = asyncio.get_event_loop()
        if loop.is_closed():
            raise RuntimeError("Loop is closed")
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(
        run_quiz_generation_pipeline(
            source_content_id=source_content_id,
            filename=filename,
            file_base64=file_base64,
            difficulty=difficulty,
            num_questions=num_questions,
        )
    )
