import asyncio
import logging
import time
from collections.abc import Awaitable, Callable

# Import schemas
from app.ai.prompts.schemas.corrected_text import CorrectedText
from app.ai.prompts.schemas.quality_report import QualityReport
from app.ai.prompts.schemas.quiz_output import QuizOutput

# Import templates
from app.ai.prompts.templates import quality_check, quiz_generation, text_correction
from app.ai.providers import get_llm_provider
from app.ai.tools.chunker import TextChunker
from app.ai.tools.parsers.router import ParserRouter
from app.ai.workflows.base import BaseWorkflow

logger = logging.getLogger(__name__)


class QuizGenerationPipeline(BaseWorkflow):
    def __init__(self):
        self.router = ParserRouter()
        self._provider = None

    @property
    def provider(self):
        if self._provider is None:
            self._provider = get_llm_provider()
        return self._provider

    async def run(
        self,
        filename: str,
        file_bytes: bytes,
        difficulty: str = "medium",
        num_questions: int = 5,
        trace_id: str = "",
        status_callback: Callable[[str], Awaitable[None]] | None = None,
    ) -> tuple[CorrectedText, QuizOutput, QualityReport, dict]:
        pipeline_start = time.monotonic()
        logger.info(
            "[%s] Pipeline started | file=%s difficulty=%s num_questions=%d",
            trace_id,
            filename,
            difficulty,
            num_questions,
        )
        if status_callback:
            await status_callback("parsing")

        # Step 1: Extract Text
        raw_text = await self.router.parse_file(filename, file_bytes)
        self.raw_text = raw_text
        stripped_text = raw_text.strip()
        if not stripped_text:
            raise ValueError("No text could be extracted from the uploaded document.")

        char_count = len(stripped_text)

        # 1. Validate minimum character length
        if char_count < 100:
            raise ValueError(
                f"Extracted text is too short to generate meaningful questions (minimum 100 characters, got {char_count})."
            )

        # 2. Validate maximum character length
        if char_count > 500_000:
            raise ValueError(
                f"Document is too large (maximum 500,000 characters, got {char_count}). Please upload a shorter document or split it into sections."
            )

        logger.info("[%s] Step 1 complete | extracted_chars=%d", trace_id, char_count)

        # Step 2: Correct Text using AI
        if status_callback:
            await status_callback("correcting")

        try:
            if char_count > 10000:
                logger.info(
                    "[%s] Text size (%d chars) exceeds threshold. Chunking...",
                    trace_id,
                    char_count,
                )
                chunker = TextChunker()
                chunks = chunker.split_text(raw_text, chunk_size=8000, chunk_overlap=1000)
                logger.info("[%s] Split text into %d chunks", trace_id, len(chunks))

                async def process_chunk(chunk_text: str):
                    # Create separate provider to avoid race conditions on last_usage
                    from app.ai.providers.openai_provider import OpenAIProvider

                    chunk_provider = OpenAIProvider(
                        api_key=self.provider.client.api_key,
                        base_url=self.provider.client.base_url,
                        model=self.provider.model,
                    )
                    prompt = text_correction.USER_PROMPT_TEMPLATE.format(
                        raw_text=chunk_text
                    )
                    res: CorrectedText = await chunk_provider.generate_response(
                        prompt=prompt,
                        system_prompt=text_correction.SYSTEM_PROMPT,
                        response_model=CorrectedText,
                        temperature=0.1,
                    )
                    return res, chunk_provider.last_usage

                tasks = [process_chunk(chunk) for chunk in chunks]
                results = await asyncio.gather(*tasks)

                corrected_texts = []
                confidence_scores = []
                corrections_made = []
                total_prompt_tokens = 0
                total_completion_tokens = 0
                total_tokens = 0

                for res_obj, usage in results:
                    corrected_texts.append(res_obj.corrected_text)
                    confidence_scores.append(res_obj.confidence_score)
                    corrections_made.extend(res_obj.corrections_made)
                    total_prompt_tokens += usage.get("prompt_tokens", 0)
                    total_completion_tokens += usage.get("completion_tokens", 0)
                    total_tokens += usage.get("total_tokens", 0)

                corrected_text_obj = CorrectedText(
                    corrected_text="\n\n".join(corrected_texts),
                    confidence_score=(
                        sum(confidence_scores) / len(confidence_scores)
                        if confidence_scores
                        else 1.0
                    ),
                    corrections_made=corrections_made,
                )
                correction_usage = {
                    "prompt_tokens": total_prompt_tokens,
                    "completion_tokens": total_completion_tokens,
                    "total_tokens": total_tokens,
                }
            else:
                correction_prompt = text_correction.USER_PROMPT_TEMPLATE.format(
                    raw_text=raw_text
                )
                corrected_text_obj: CorrectedText = await self.provider.generate_response(
                    prompt=correction_prompt,
                    system_prompt=text_correction.SYSTEM_PROMPT,
                    response_model=CorrectedText,
                    temperature=0.1,
                )
                correction_usage = self.provider.last_usage.copy()
        except Exception as e:
            logger.error(
                "[%s] Text correction failed, using raw text as fallback. Error: %s",
                trace_id,
                str(e),
            )
            corrected_text_obj = CorrectedText(
                corrected_text=raw_text,
                confidence_score=0.0,
                corrections_made=["Text correction failed, using raw text"],
            )
            correction_usage = {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0,
            }

        logger.info(
            "[%s] Step 2 complete | corrected_chars=%d confidence=%.2f corrections=%d",
            trace_id,
            len(corrected_text_obj.corrected_text),
            corrected_text_obj.confidence_score,
            len(corrected_text_obj.corrections_made),
        )

        # Step 3: Generate Quiz from corrected text
        if status_callback:
            await status_callback("generating")

        generation_prompt = quiz_generation.USER_PROMPT_TEMPLATE.format(
            difficulty=difficulty,
            num_questions=num_questions,
            source_text=corrected_text_obj.corrected_text,
        )
        quiz_output_obj: QuizOutput = await self.provider.generate_response(
            prompt=generation_prompt,
            system_prompt=quiz_generation.SYSTEM_PROMPT,
            response_model=QuizOutput,
            temperature=0.4,
        )
        generation_usage = self.provider.last_usage.copy()

        # Validate generated quiz and auto-retry if issues are found
        from app.ai.tools.quiz_validator import QuizOutputValidator
        validator = QuizOutputValidator()
        is_valid, issues = validator.validate(quiz_output_obj, num_questions)

        if not is_valid:
            logger.warning(
                "[%s] Quiz validation failed on first attempt. Issues:\n%s",
                trace_id,
                "\n".join(f"- {issue}" for issue in issues),
            )

            # Retry with feedback
            retry_prompt = (
                f"{generation_prompt}\n\n"
                "CRITICAL: The previous output was invalid. Please regenerate the quiz, resolving the following validation errors:\n"
                + "\n".join(f"- {issue}" for issue in issues)
            )

            logger.info("[%s] Retrying quiz generation (attempt 2)...", trace_id)
            quiz_output_obj = await self.provider.generate_response(
                prompt=retry_prompt,
                system_prompt=quiz_generation.SYSTEM_PROMPT,
                response_model=QuizOutput,
                temperature=0.3,
            )

            # Accumulate retry token usage
            retry_usage = self.provider.last_usage.copy()
            generation_usage["prompt_tokens"] += retry_usage.get("prompt_tokens", 0)
            generation_usage["completion_tokens"] += retry_usage.get("completion_tokens", 0)
            generation_usage["total_tokens"] += retry_usage.get("total_tokens", 0)

            # Re-validate second attempt
            is_valid, issues = validator.validate(quiz_output_obj, num_questions)
            if not is_valid:
                logger.error(
                    "[%s] Quiz validation failed on second attempt. Proceeding with issues. Issues:\n%s",
                    trace_id,
                    "\n".join(f"- {issue}" for issue in issues),
                )
            else:
                logger.info("[%s] Quiz validation passed on second attempt.", trace_id)
        else:
            logger.info("[%s] Quiz validation passed on first attempt.", trace_id)

        logger.info(
            "[%s] Step 3 complete | questions_generated=%d title=%s",
            trace_id,
            len(quiz_output_obj.questions),
            quiz_output_obj.title,
        )

        # Step 4: Audit / Quality Check the generated quiz
        if status_callback:
            await status_callback("auditing")

        try:
            quiz_json_str = quiz_output_obj.model_dump_json(indent=2)
            audit_prompt = quality_check.USER_PROMPT_TEMPLATE.format(
                quiz_json=quiz_json_str
            )
            quality_report_obj: QualityReport = await self.provider.generate_response(
                prompt=audit_prompt,
                system_prompt=quality_check.SYSTEM_PROMPT,
                response_model=QualityReport,
                temperature=0.1,
            )
            audit_usage = self.provider.last_usage.copy()
            logger.info(
                "[%s] Step 4 complete | quality_score=%d is_passing=%s issues=%d",
                trace_id,
                quality_report_obj.score,
                quality_report_obj.is_passing,
                len(quality_report_obj.issues),
            )
        except Exception as e:
            logger.error(
                "[%s] Quality audit failed, proceeding without audit. Error: %s",
                trace_id,
                str(e),
            )
            quality_report_obj = QualityReport(
                score=0,
                is_passing=False,
                issues=["Audit could not be performed"],
                suggestions=[],
            )
            audit_usage = {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0,
            }

        # Aggregate token usage across all steps
        token_usage = {
            "text_correction": correction_usage,
            "quiz_generation": generation_usage,
            "quality_check": audit_usage,
            "total_tokens": (
                correction_usage.get("total_tokens", 0)
                + generation_usage.get("total_tokens", 0)
                + audit_usage.get("total_tokens", 0)
            ),
        }

        total_time = time.monotonic() - pipeline_start
        logger.info(
            "[%s] Pipeline finished | total_time=%.2fs total_tokens=%d",
            trace_id,
            total_time,
            token_usage["total_tokens"],
        )

        return corrected_text_obj, quiz_output_obj, quality_report_obj, token_usage
