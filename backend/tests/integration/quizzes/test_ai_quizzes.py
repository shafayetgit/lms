import uuid
from unittest.mock import AsyncMock, patch

import pytest
import pytest_asyncio
from app.models.ai_content import AIDraftQuiz, AISourceContent
from app.models.question import Choice, Question
from app.models.quiz import Quiz
from app.models.user import User
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


@pytest_asyncio.fixture(autouse=True)
async def clean_rate_limits(client):
    from app.core.redis import get_redis_client

    redis_client = get_redis_client()
    if redis_client:
        await redis_client.delete("rate_limit:generate_quiz:1")
    yield
    if redis_client:
        await redis_client.delete("rate_limit:generate_quiz:1")


@pytest_asyncio.fixture
async def test_admin(db_session: AsyncSession):
    user = User(
        username=f"admin_{uuid.uuid4().hex[:8]}",
        email=f"admin_{uuid.uuid4().hex[:8]}@example.com",
        hashed_password="hashed",
        role="admin",
        is_active=True,
        first_name="Admin",
        last_name="User",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_draft_quiz(db_session: AsyncSession, test_admin):
    # 1. Create source content
    source = AISourceContent(
        title="Physics 101",
        original_filename="physics.pdf",
        raw_text="Gravity is attraction.",
        corrected_text="Gravity is attraction between masses.",
        owner_id=test_admin.id,
    )
    db_session.add(source)
    await db_session.commit()
    await db_session.refresh(source)

    # 2. Create draft quiz
    draft = AIDraftQuiz(
        source_content_id=source.id,
        difficulty="medium",
        num_questions=1,
        quiz_data={
            "title": "Gravity Quiz",
            "description": "Test your gravity knowledge",
            "questions": [
                {
                    "question_text": "What is gravity?",
                    "options": ["A force", "A fluid", "A solid"],
                    "correct_option": "A force",
                    "explanation": "Gravity is attraction.",
                }
            ],
        },
        quality_report={"overall_score": 9.5, "feedback": "Great quiz."},
        status="pending_review",
        owner_id=test_admin.id,
    )
    db_session.add(draft)
    await db_session.commit()
    await db_session.refresh(draft)
    return draft


@pytest.mark.asyncio
async def test_generate_quiz_endpoint(client: AsyncClient, test_admin):
    """Test generating a quiz via endpoint (mocking celery task)."""
    from app.core.dependencies import get_current_active_user
    from app.main import app

    app.dependency_overrides[get_current_active_user] = lambda: test_admin

    try:
        # Mock run_quiz_generation_task.delay
        with patch("app.tasks.ai_content.run_quiz_generation_task.delay") as mock_delay:
            mock_delay.return_value.id = "mocked-task-id-123"
            # Send file upload request
            files = {
                "file": (
                    "test.txt",
                    b"Dummy text file contents for testing.",
                    "text/plain",
                )
            }
            data = {
                "title": "Test Document",
                "difficulty": "easy",
                "num_questions": "3",
            }

            res = await client.post(
                "/api/v1/ai-quizzes/generate", files=files, data=data
            )
            assert res.status_code == 202
            body = res.json()
            assert body["success"] is True
            assert "data" in body
            assert body["data"]["title"] == "Test Document"
            mock_delay.assert_called_once()
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_and_update_draft(client: AsyncClient, test_admin, test_draft_quiz):
    """Test retrieving and human editing of a draft quiz."""
    from app.core.dependencies import get_current_active_user
    from app.main import app

    app.dependency_overrides[get_current_active_user] = lambda: test_admin

    try:
        draft_id = test_draft_quiz.public_id

        # 1. Retrieve draft details
        res_get = await client.get(f"/api/v1/ai-quizzes/drafts/{draft_id}")
        assert res_get.status_code == 200
        body_get = res_get.json()
        assert body_get["quiz_data"]["title"] == "Gravity Quiz"

        # 2. Update draft quiz questions
        updated_data = {
            "quiz_data": {
                "title": "Updated Gravity Quiz",
                "description": "New description",
                "questions": [
                    {
                        "question_text": "Is gravity a force?",
                        "options": ["Yes", "No"],
                        "correct_option": "Yes",
                        "explanation": "Yes, gravity is an attractive force.",
                    }
                ],
            }
        }
        res_put = await client.put(
            f"/api/v1/ai-quizzes/drafts/{draft_id}", json=updated_data
        )
        assert res_put.status_code == 200
        body_put = res_put.json()["data"]
        assert body_put["quiz_data"]["title"] == "Updated Gravity Quiz"
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_confirm_draft_quiz(
    client: AsyncClient, test_admin, test_draft_quiz, db_session: AsyncSession
):
    """Test confirming draft quiz and converting to standard LMS models."""
    from app.core.dependencies import get_current_active_user
    from app.main import app

    app.dependency_overrides[get_current_active_user] = lambda: test_admin

    try:
        draft_id = test_draft_quiz.public_id

        confirm_payload = {
            "title_override": "Final Gravity Quiz",
            "description_override": "Confirmed description",
        }
        res_confirm = await client.post(
            f"/api/v1/ai-quizzes/drafts/{draft_id}/confirm", json=confirm_payload
        )
        assert res_confirm.status_code == 201 or res_confirm.status_code == 200
        body = res_confirm.json()["data"]

        # 1. Check response returns created Quiz ID
        assert body["title"] == "Final Gravity Quiz"
        quiz_public_id = body["public_id"]

        # 2. Verify in standard LMS database tables
        stmt_quiz = select(Quiz).where(Quiz.public_id == quiz_public_id)
        res_db = await db_session.execute(stmt_quiz)
        quiz_obj = res_db.scalars().first()
        assert quiz_obj is not None
        assert quiz_obj.description == "Confirmed description"

        # Check questions and choices created
        stmt_q = select(Question).where(Question.quiz_id == quiz_obj.id)
        res_q = await db_session.execute(stmt_q)
        questions = list(res_q.scalars().all())
        assert len(questions) == 1
        assert (
            questions[0].text == "Gravity? What is gravity?"
            or questions[0].text == "What is gravity?"
        )

        stmt_c = select(Choice).where(Choice.question_id == questions[0].id)
        res_c = await db_session.execute(stmt_c)
        choices = list(res_c.scalars().all())
        assert len(choices) == 3
        correct_choices = [c for c in choices if c.is_correct]
        assert len(correct_choices) == 1
        assert correct_choices[0].text == "A force"
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_pipeline_large_document_correction():
    """Test that the quiz pipeline chunks documents > 10,000 chars and processes chunks in parallel."""
    from app.ai.workflows.quiz_pipeline import QuizGenerationPipeline
    from app.ai.prompts.schemas.corrected_text import CorrectedText
    from app.ai.prompts.schemas.quiz_output import QuizOutput
    from app.ai.prompts.schemas.quality_report import QualityReport

    pipeline = QuizGenerationPipeline()

    # Create a dummy large document (12,000 chars)
    large_text = "A " * 6000

    # Mock return values for each LLM step
    mock_corrected = CorrectedText(
        corrected_text="Corrected paragraph.",
        confidence_score=0.95,
        corrections_made=[],
    )
    mock_quiz = QuizOutput(
        title="Mock Large Quiz",
        description="Generated from large doc",
        questions=[],
    )
    mock_audit = QualityReport(
        is_passing=True,
        score=92,
        feedback="Good quality",
        issues=[],
        suggestions=[],
    )

    with patch(
        "app.ai.providers.openai_provider.OpenAIProvider.generate_response",
        autospec=True,
    ) as mock_gen:
        call_count = 0
        side_effects = [mock_corrected, mock_corrected, mock_quiz, mock_audit]

        async def mock_generate_resp(self_instance, prompt, **kwargs):
            nonlocal call_count
            self_instance.last_usage = {
                "prompt_tokens": 10,
                "completion_tokens": 5,
                "total_tokens": 15,
            }
            res = side_effects[call_count]
            call_count += 1
            return res

        mock_gen.side_effect = mock_generate_resp

        corrected, quiz, audit, usage = await pipeline.run(
            filename="large_test_doc.txt",
            file_bytes=large_text.encode("utf-8"),
            difficulty="medium",
            num_questions=5,
            trace_id="trace-large-test",
        )

        # Assert correct chunking and processing calls:
        # 12,000 chars split into 2 chunks of max 8,000 + 1 quiz + 1 audit = 4 calls total
        assert mock_gen.call_count == 4
        assert corrected.corrected_text == "Corrected paragraph.\n\nCorrected paragraph."
        assert corrected.confidence_score == 0.95
        assert quiz.title == "Mock Large Quiz"
        assert audit.is_passing is True
        assert usage["text_correction"]["total_tokens"] == 30  # 15 * 2 chunks


@pytest.mark.asyncio
async def test_run_quiz_generation_task_stores_prompt_version(
    db_session: AsyncSession, test_admin
):
    from app.tasks.ai_content import run_quiz_generation_pipeline
    from app.ai.prompts.schemas.corrected_text import CorrectedText
    from app.ai.prompts.schemas.quiz_output import QuizOutput, QuizQuestionSchema
    from app.ai.prompts.schemas.quality_report import QualityReport
    import base64
    import asyncio

    # 1. Create source content record
    source = AISourceContent(
        title="Cell Biology",
        original_filename="biology.txt",
        raw_text="The cell is the basic structural and functional unit of all organisms. It contains DNA, organelles, cytoplasm, and a membrane.",
        corrected_text="",
        owner_id=test_admin.id,
        status="queued",
    )
    db_session.add(source)
    await db_session.commit()
    await db_session.refresh(source)

    # 2. Mock the pipeline
    mock_corrected = CorrectedText(
        corrected_text="The cell is the basic structural and functional unit of all organisms. It contains DNA, organelles, cytoplasm, and a membrane.",
        confidence_score=0.99,
        corrections_made=[],
    )
    mock_quiz = QuizOutput(
        title="Biology Quiz",
        description="A biology quiz",
        questions=[
            QuizQuestionSchema(
                question_text="What is a cell?",
                options=["A building block", "A liquid", "A gas", "A solid"],
                correct_option="A building block",
                explanation="Cell is the basic unit.",
            )
        ],
    )
    mock_audit = QualityReport(
        is_passing=True,
        score=95,
        issues=[],
        suggestions=[],
    )

    class MockSessionMaker:
        def __init__(self):
            class SessionWrapper:
                def __init__(self, session):
                    self.session = session

                def __getattr__(self, name):
                    return getattr(self.session, name)

                async def commit(self):
                    pass

                async def __aenter__(self):
                    return self

                async def __aexit__(self, exc_type, exc_val, exc_tb):
                    pass

            self.wrapper = SessionWrapper(db_session)

        async def __aenter__(self):
            return self.wrapper

        async def __aexit__(self, exc_type, exc_val, exc_tb):
            pass

        def __call__(self):
            return self

    mock_session_maker = MockSessionMaker()

    with patch(
        "app.ai.providers.openai_provider.OpenAIProvider.generate_response",
        autospec=True,
    ) as mock_gen, patch(
        "app.db.session.get_session_maker",
        return_value=mock_session_maker,
    ), patch(
        "app.db.session.dispose_current_loop_engine",
        new_callable=AsyncMock,
    ):
        call_count = 0
        side_effects = [mock_corrected, mock_quiz, mock_audit]

        async def mock_generate_resp(self_instance, prompt, **kwargs):
            nonlocal call_count
            self_instance.last_usage = {
                "prompt_tokens": 10,
                "completion_tokens": 5,
                "total_tokens": 15,
            }
            res = side_effects[call_count]
            call_count += 1
            return res

        mock_gen.side_effect = mock_generate_resp

        file_base64 = base64.b64encode(
            b"The cell is the basic structural and functional unit of all organisms. It contains DNA, organelles, cytoplasm, and a membrane."
        ).decode("utf-8")

        # 3. Execute celery task's async pipeline logic directly
        await run_quiz_generation_pipeline(
            source_content_id=source.id,
            filename="biology.txt",
            file_base64=file_base64,
            difficulty="easy",
            num_questions=1,
        )

        # 4. Refresh source from database to verify meta_info has prompt_version
        await db_session.refresh(source)

        assert source is not None
        assert source.status == "completed"
        assert source.meta_info is not None
        assert source.meta_info.get("prompt_version") == "1.0"
        assert source.meta_info.get("confidence_score") == 0.99


@pytest.mark.asyncio
async def test_generate_quiz_rate_limit(client: AsyncClient, test_admin):
    """Test that generating quizzes is rate limited to 5 requests per minute per user."""
    from app.core.dependencies import get_current_active_user
    from app.main import app

    app.dependency_overrides[get_current_active_user] = lambda: test_admin

    try:
        # Mock run_quiz_generation_task.delay
        with patch("app.tasks.ai_content.run_quiz_generation_task.delay") as mock_delay:
            mock_delay.return_value.id = "mocked-task-id-123"

            # Send file upload requests in a loop
            files = {
                "file": (
                    "test.txt",
                    b"Dummy text file contents for testing.",
                    "text/plain",
                )
            }
            data = {
                "title": "Test Document",
                "difficulty": "easy",
                "num_questions": "3",
            }

            # First 5 requests should succeed (202 Accepted)
            for _ in range(5):
                res = await client.post(
                    "/api/v1/ai-quizzes/generate", files=files, data=data
                )
                assert res.status_code == 202

            # 6th request should be rate limited (429 Too Many Requests)
            res = await client.post(
                "/api/v1/ai-quizzes/generate", files=files, data=data
            )
            assert res.status_code == 429
            body = res.json()
            assert body["success"] is False
            assert body["message"] == "Rate limit exceeded. Please wait before generating another quiz."

    finally:
        app.dependency_overrides.clear()



