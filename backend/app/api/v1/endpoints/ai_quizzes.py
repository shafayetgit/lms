import base64
import os
from typing import Annotated, Any

from app.api.deps import get_db
from app.core.dependencies import PermissionChecker
from app.core.responses import create_response, read_response, update_response
from app.schemas.ai_content import (
    AIDraftQuizResponse,
    AIDraftQuizUpdateRequest,
    AIGenerationStatusResponse,
    AIQuizConfirmationRequest,
    AISourceContentResponse,
)
from app.schemas.quiz import QuizRead
from app.services.ai_quiz import ai_quiz_service
from app.services.ai_source_content import ai_source_content_service
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md", ".docx", ".png", ".jpg", ".jpeg"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "text/plain",
    "text/markdown",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
}


@router.post(
    "/generate",
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(PermissionChecker("quiz", "create"))],
)
async def generate_quiz_from_file(
    file: Annotated[UploadFile, File(...)],
    title: Annotated[str, Form(...)],
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Any, Depends(PermissionChecker("quiz", "create"))],
    difficulty: Annotated[str, Form()] = "medium",
    num_questions: Annotated[int, Form()] = 5,
):
    """
    Upload a document file, extract text, and kick off the AI generation pipeline in the background.
    """
    # 0. Check Rate Limit (5 requests per minute per user)
    from app.core.redis import get_redis_client
    redis_client = get_redis_client()
    if redis_client:
        rate_limit_key = f"rate_limit:generate_quiz:{current_user.id}"
        try:
            count = await redis_client.incr(rate_limit_key)
            if count == 1:
                await redis_client.expire(rate_limit_key, 60)
            elif count > 5:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please wait before generating another quiz.",
                )
        except HTTPException:
            raise
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Redis rate limiter error | error={str(e)}")

    # 1. Validate difficulty parameter
    valid_difficulties = ["easy", "medium", "hard"]
    if difficulty not in valid_difficulties:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid difficulty. Must be one of: {', '.join(valid_difficulties)}",
        )

    # 2. Validate num_questions parameter
    if not (1 <= num_questions <= 30):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Number of questions must be between 1 and 30",
        )

    # 3. Validate file extension before reading
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Filename is missing"
        )

    _, ext = os.path.splitext(file.filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension: {ext}. Allowed extensions are: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    # 4. Read content and validate size
    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty"
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE // (1024 * 1024)}MB",
        )

    # 5. Validate MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid content type: {file.content_type}. Allowed types are: {', '.join(sorted(ALLOWED_MIME_TYPES))}",
        )

    # Base64 encode the file content to safely pass to Celery
    file_base64 = base64.b64encode(content).decode("utf-8")

    try:
        source_content = await ai_quiz_service.initiate_quiz_generation(
            db=db,
            title=title,
            filename=file.filename,
            file_base64=file_base64,
            difficulty=difficulty,
            num_questions=num_questions,
            owner_id=current_user.id,
        )

        response_data = AISourceContentResponse.model_validate(
            source_content
        ).model_dump(by_alias=False)
        return create_response(
            response_data,
            message="Quiz generation initiated successfully",
            status_code=status.HTTP_202_ACCEPTED,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate quiz generation: {e!s}",
        )


@router.post(
    "/regenerate/{source_public_id}",
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(PermissionChecker("quiz", "create"))],
)
async def regenerate_quiz(
    source_public_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Any, Depends(PermissionChecker("quiz", "create"))],
    difficulty: Annotated[str, Form()] = "medium",
    num_questions: Annotated[int, Form()] = 5,
):
    """
    Regenerate a quiz from an existing source document, skipping OCR and text correction.
    """
    # 0. Check Rate Limit (5 requests per minute per user)
    from app.core.redis import get_redis_client
    redis_client = get_redis_client()
    if redis_client:
        rate_limit_key = f"rate_limit:regenerate_quiz:{current_user.id}"
        try:
            count = await redis_client.incr(rate_limit_key)
            if count == 1:
                await redis_client.expire(rate_limit_key, 60)
            elif count > 5:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please wait before regenerating another quiz.",
                )
        except HTTPException:
            raise
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Redis rate limiter error | error={str(e)}")

    valid_difficulties = ["easy", "medium", "hard"]
    if difficulty not in valid_difficulties:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid difficulty. Must be one of: {', '.join(valid_difficulties)}",
        )

    if not (1 <= num_questions <= 30):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Number of questions must be between 1 and 30",
        )

    try:
        source_content = await ai_quiz_service.regenerate_quiz(
            db=db,
            source_public_id=source_public_id,
            difficulty=difficulty,
            num_questions=num_questions,
        )

        if not source_content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Original document source not found.",
            )

        response_data = AISourceContentResponse.model_validate(
            source_content
        ).model_dump(by_alias=False)
        return create_response(
            response_data,
            message="Quiz regeneration initiated successfully",
            status_code=status.HTTP_202_ACCEPTED,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate quiz regeneration: {e!s}",
        )


@router.get(
    "/status/{source_public_id}",
    response_model=None,
    dependencies=[Depends(PermissionChecker("quiz", "read"))],
)
async def get_generation_status(
    source_public_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Retrieve real-time generation status for an AI quiz pipeline run.
    """
    status_data = await ai_source_content_service.get_generation_status(db, source_public_id)
    if not status_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Generation source not found",
        )

    response_data = AIGenerationStatusResponse.model_validate(status_data).model_dump(
        by_alias=False
    )
    return read_response({"data": response_data})


@router.get(
    "/drafts",
    response_model=None,
    dependencies=[Depends(PermissionChecker("quiz", "read"))],
)
async def list_draft_quizzes(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Any, Depends(PermissionChecker("quiz", "read"))],
):
    """
    List all pending AI-generated draft quizzes for the current user.
    """
    from app.repositories.ai_quiz import ai_draft_quiz_repo
    drafts = await ai_draft_quiz_repo.get_user_drafts(db, owner_id=current_user.id)
    
    response_data = [
        AIDraftQuizResponse.model_validate(d).model_dump(by_alias=False)
        for d in drafts
    ]
    return read_response({"data": response_data})


@router.get(
    "/drafts/{draft_public_id}",
    response_model=None,
    dependencies=[Depends(PermissionChecker("quiz", "read"))],
)
async def get_draft_quiz(
    draft_public_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Retrieve the AI-generated draft quiz details and its quality review report.
    """
    draft = await ai_quiz_service.get_draft_quiz(db, draft_public_id)
    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Draft quiz not found"
        )

    response_data = AIDraftQuizResponse.model_validate(draft).model_dump(by_alias=False)
    return read_response({"data": response_data})


@router.put(
    "/drafts/{draft_public_id}",
    response_model=None,
    dependencies=[Depends(PermissionChecker("quiz", "update"))],
)
async def update_draft_quiz(
    draft_public_id: str,
    obj_in: AIDraftQuizUpdateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Update the draft quiz questions/options (human editing/corrections).
    """
    updated_draft = await ai_quiz_service.update_draft_quiz(
        db, draft_public_id, obj_in
    )
    if not updated_draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Draft quiz not found"
        )

    response_data = AIDraftQuizResponse.model_validate(updated_draft).model_dump(
        by_alias=False
    )
    return update_response(response_data, message="Draft quiz updated successfully")


@router.post(
    "/drafts/{draft_public_id}/confirm",
    response_model=None,
    dependencies=[Depends(PermissionChecker("quiz", "create"))],
)
async def confirm_draft_quiz(
    draft_public_id: str,
    obj_in: AIQuizConfirmationRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Any, Depends(PermissionChecker("quiz", "create"))],
):
    """
    Confirm and publish the draft quiz, converting it into a live LMS Quiz.
    """
    live_quiz = await ai_quiz_service.confirm_and_publish_quiz(
        db=db,
        public_id=draft_public_id,
        obj_in=obj_in,
        owner_id=current_user.id,
    )
    if not live_quiz:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not publish quiz. Draft may not exist, or has already been confirmed.",
        )

    response_data = QuizRead.model_validate(live_quiz).model_dump(by_alias=False)
    return create_response(response_data, message="Quiz published successfully")
