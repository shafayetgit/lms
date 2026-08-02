from unittest.mock import AsyncMock, patch
import pytest
from app.ai.workflows.quiz_pipeline import QuizGenerationPipeline
from app.ai.prompts.schemas.corrected_text import CorrectedText
from app.ai.prompts.schemas.quiz_output import QuizOutput, QuizQuestionSchema
from app.ai.prompts.schemas.quality_report import QualityReport


@pytest.mark.asyncio
async def test_pipeline_runs_all_four_steps():
    pipeline = QuizGenerationPipeline()

    mock_corrected = CorrectedText(
        corrected_text="Corrected paragraph.",
        confidence_score=0.95,
        corrections_made=[],
    )
    mock_quiz = QuizOutput(
        title="Mock Quiz",
        description="A mock quiz",
        questions=[
            QuizQuestionSchema(
                question_text="Q1",
                options=["A", "B", "C", "D"],
                correct_option="A",
                explanation="Expl",
            )
        ],
    )
    mock_audit = QualityReport(
        is_passing=True,
        score=90,
        issues=[],
        suggestions=[],
    )

    with patch(
        "app.ai.providers.openai_provider.OpenAIProvider.generate_response",
        autospec=True,
    ) as mock_gen:
        call_count = 0
        side_effects = [mock_corrected, mock_quiz, mock_audit]

        async def mock_generate_resp(self_instance, prompt, **kwargs):
            nonlocal call_count
            self_instance.last_usage = {
                "prompt_tokens": 5,
                "completion_tokens": 2,
                "total_tokens": 7,
            }
            res = side_effects[call_count]
            call_count += 1
            return res

        mock_gen.side_effect = mock_generate_resp

        corrected, quiz, audit, usage = await pipeline.run(
            filename="test.txt",
            file_bytes=b"This is some raw document text that is longer than one hundred characters so that it passes the character count validation checks.",
            difficulty="medium",
            num_questions=1,
            trace_id="trace-test",
        )

        assert mock_gen.call_count == 3
        assert corrected.corrected_text == "Corrected paragraph."
        assert quiz.title == "Mock Quiz"
        assert audit.is_passing is True
        assert usage["quiz_generation"]["total_tokens"] == 7


@pytest.mark.asyncio
async def test_pipeline_raises_on_empty_text():
    pipeline = QuizGenerationPipeline()

    with pytest.raises(ValueError, match="minimum 100 characters"):
        await pipeline.run(
            filename="empty.txt",
            file_bytes=b"too short",
            difficulty="medium",
            num_questions=5,
            trace_id="trace-empty",
        )


@pytest.mark.asyncio
async def test_pipeline_auto_retry_on_invalid_quiz():
    pipeline = QuizGenerationPipeline()

    mock_corrected = CorrectedText(
        corrected_text="Corrected paragraph.",
        confidence_score=0.95,
        corrections_made=[],
    )
    # First quiz output is invalid (only 3 options instead of 4)
    mock_quiz_invalid = QuizOutput(
        title="Invalid Quiz",
        description="A mock quiz",
        questions=[
            QuizQuestionSchema(
                question_text="Q1",
                options=["A", "B", "C"],
                correct_option="A",
                explanation="Expl",
            )
        ],
    )
    # Second quiz output is valid (4 options)
    mock_quiz_valid = QuizOutput(
        title="Valid Quiz",
        description="A mock quiz",
        questions=[
            QuizQuestionSchema(
                question_text="Q1",
                options=["A", "B", "C", "D"],
                correct_option="A",
                explanation="Expl",
            )
        ],
    )
    mock_audit = QualityReport(
        is_passing=True,
        score=90,
        issues=[],
        suggestions=[],
    )

    with patch(
        "app.ai.providers.openai_provider.OpenAIProvider.generate_response",
        autospec=True,
    ) as mock_gen:
        call_count = 0
        side_effects = [
            mock_corrected,
            mock_quiz_invalid,
            mock_quiz_valid,
            mock_audit,
        ]

        async def mock_generate_resp(self_instance, prompt, **kwargs):
            nonlocal call_count
            self_instance.last_usage = {
                "prompt_tokens": 5,
                "completion_tokens": 2,
                "total_tokens": 7,
            }
            res = side_effects[call_count]
            call_count += 1
            return res

        mock_gen.side_effect = mock_generate_resp

        corrected, quiz, audit, usage = await pipeline.run(
            filename="test.txt",
            file_bytes=b"This is some raw document text that is longer than one hundred characters so that it passes the character count validation checks.",
            difficulty="medium",
            num_questions=1,
            trace_id="trace-test-retry",
        )

        # 1 correction + 2 quiz generations + 1 audit = 4 calls total
        assert mock_gen.call_count == 4
        assert quiz.title == "Valid Quiz"
        # Total tokens for quiz generation should be 14 (7 + 7)
        assert usage["quiz_generation"]["total_tokens"] == 14


@pytest.mark.asyncio
async def test_pipeline_graceful_degradation_text_correction():
    pipeline = QuizGenerationPipeline()

    mock_quiz = QuizOutput(
        title="Mock Quiz",
        description="A mock quiz",
        questions=[
            QuizQuestionSchema(
                question_text="Q1",
                options=["A", "B", "C", "D"],
                correct_option="A",
                explanation="Expl",
            )
        ],
    )
    mock_audit = QualityReport(
        is_passing=True,
        score=90,
        issues=[],
        suggestions=[],
    )

    with patch(
        "app.ai.providers.openai_provider.OpenAIProvider.generate_response",
        autospec=True,
    ) as mock_gen:
        call_count = 0

        async def mock_generate_resp(self_instance, prompt, **kwargs):
            nonlocal call_count
            self_instance.last_usage = {
                "prompt_tokens": 5,
                "completion_tokens": 2,
                "total_tokens": 7,
            }
            if call_count == 0:
                call_count += 1
                raise ValueError("LLM Error during text correction")
            elif call_count == 1:
                call_count += 1
                return mock_quiz
            else:
                call_count += 1
                return mock_audit

        mock_gen.side_effect = mock_generate_resp

        raw_input = b"This is some raw document text that is longer than one hundred characters so that it passes the character count validation checks."
        corrected, quiz, audit, usage = await pipeline.run(
            filename="test.txt",
            file_bytes=raw_input,
            difficulty="medium",
            num_questions=1,
            trace_id="trace-test-degrad-correct",
        )

        assert mock_gen.call_count == 3
        # Should fallback to raw text
        assert corrected.corrected_text == raw_input.decode("utf-8")
        assert corrected.confidence_score == 0.0
        assert "failed" in corrected.corrections_made[0]
        assert quiz.title == "Mock Quiz"
        assert audit.is_passing is True


@pytest.mark.asyncio
async def test_pipeline_graceful_degradation_quality_audit():
    pipeline = QuizGenerationPipeline()

    mock_corrected = CorrectedText(
        corrected_text="Corrected text.",
        confidence_score=0.95,
        corrections_made=[],
    )
    mock_quiz = QuizOutput(
        title="Mock Quiz",
        description="A mock quiz",
        questions=[
            QuizQuestionSchema(
                question_text="Q1",
                options=["A", "B", "C", "D"],
                correct_option="A",
                explanation="Expl",
            )
        ],
    )

    with patch(
        "app.ai.providers.openai_provider.OpenAIProvider.generate_response",
        autospec=True,
    ) as mock_gen:
        call_count = 0

        async def mock_generate_resp(self_instance, prompt, **kwargs):
            nonlocal call_count
            self_instance.last_usage = {
                "prompt_tokens": 5,
                "completion_tokens": 2,
                "total_tokens": 7,
            }
            if call_count == 0:
                call_count += 1
                return mock_corrected
            elif call_count == 1:
                call_count += 1
                return mock_quiz
            else:
                call_count += 1
                raise ValueError("LLM Error during quality check")

        mock_gen.side_effect = mock_generate_resp

        raw_input = b"This is some raw document text that is longer than one hundred characters so that it passes the character count validation checks."
        corrected, quiz, audit, usage = await pipeline.run(
            filename="test.txt",
            file_bytes=raw_input,
            difficulty="medium",
            num_questions=1,
            trace_id="trace-test-degrad-audit",
        )

        assert mock_gen.call_count == 3
        assert corrected.corrected_text == "Corrected text."
        assert quiz.title == "Mock Quiz"
        # Should fallback to default un-audited quality report
        assert audit.score == 0
        assert audit.is_passing is False
        assert audit.issues == ["Audit could not be performed"]

