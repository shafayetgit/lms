# 🛠️ Guided Workplan — AI Quiz Pipeline to Industry Level

Each task is a self-contained chunk. Do them in order. Mark ✅ when done.

---

## 📐 Naming Conventions & Best Practices

Follow these rules for **every** task below. They are derived from the existing project codebase.

### File Names
| Layer | Pattern | Examples |
|---|---|---|
| Models | `snake_case` noun | `ai_content.py`, `quiz.py`, `question.py` |
| Schemas | Same name as model | `ai_content.py`, `quiz.py` |
| Services | Same name as model | `ai_content.py`, `quiz.py` |
| Repositories | Same name as model | `ai_content.py`, `quiz.py` |
| API endpoints | Plural noun | `ai_quizzes.py`, `questions.py` |
| Celery tasks | Grouped by domain | `ai_content.py`, `emails.py` |
| AI parsers | `{format}_parser.py` | `pdf_parser.py`, `text_parser.py`, `docx_parser.py` |
| AI tools/utilities | `snake_case` descriptive | `text_chunker.py`, `quiz_validator.py` |
| Tests | `test_{module}.py` | `test_parsers.py`, `test_quiz_validator.py` |

### Class Names (PascalCase)
| Layer | Pattern | Examples |
|---|---|---|
| DB Models | `AI{Noun}` or `{Noun}` | `AISourceContent`, `AIDraftQuiz`, `Quiz`, `Question` |
| Schemas – Base | `{Model}Base` | `QuizBase`, `BadgeBase` |
| Schemas – CRUD | `{Model}Create`, `{Model}Update`, `{Model}Read` | `QuizCreate`, `QuizUpdate`, `QuizRead` |
| Schemas – Response | `{Model}Response`, `{Model}ListResponse` | `AISourceContentResponse`, `AIDraftQuizResponse` |
| Schemas – Request | `{Model}{Action}Request` | `AIDraftQuizUpdateRequest`, `AIQuizConfirmationRequest` |
| Services | `{Domain}Service` | `AIContentService`, `QuizService`, `CategoryService` |
| Repositories | `{Model}Repository` | `AISourceContentRepository`, `AIDraftQuizRepository` |
| AI Providers | `{Provider}Provider` | `OpenAIProvider`, `LLMProvider` (base) |
| AI Parsers | `{Format}Parser` | `PDFParser`, `TextParser`, `DocxParser`, `ImageVisionParser` |
| AI Workflows | `{Feature}Pipeline` | `QuizGenerationPipeline` |
| AI Pydantic schemas | Descriptive noun | `QuizOutput`, `CorrectedText`, `QualityReport` |
| AI Tools | `{Purpose}{Tool}` | `TextChunker`, `QuizOutputValidator`, `ParserRouter` |

### Function & Method Names (snake_case)
| Type | Pattern | Examples |
|---|---|---|
| Service methods | `verb_noun` | `initiate_quiz_generation()`, `confirm_and_publish_quiz()`, `get_draft_quiz()` |
| Repository methods | `get_by_{field}`, `get_{filtered}` | `get_by_public_id()`, `get_pending_drafts()` |
| Celery tasks | `run_{feature}_task` | `run_quiz_generation_task()` |
| Parser methods | `parse()` (from base ABC) | Always `async def parse(self, file_bytes: bytes) -> str` |
| Workflow entry | `run()` (from base ABC) | Always `async def run(self, ...)` |
| Factory functions | `get_{thing}` | `get_llm_provider()`, `get_session_maker()` |
| Private helpers | `_verb_noun` | `_log_usage()`, `_validate_batch_fields()` |

### Variable Names
| Type | Pattern | Examples |
|---|---|---|
| Pydantic instances | `{schema}_obj` | `corrected_text_obj`, `quiz_output_obj`, `quality_report_obj` |
| DB instances | `{model}_obj` or short name | `source_obj`, `draft`, `quiz_obj`, `question_obj` |
| Dict payloads | `{purpose}_in` | `source_in`, `draft_in` |
| Repo singletons | `{model_snake}_repo` | `ai_source_content_repo`, `ai_draft_quiz_repo` |
| Service singletons | `{domain}_service` | `ai_content_service` |
| Logger | `logger` | Always `logger = logging.getLogger(__name__)` |
| Provider | `self._provider` (lazy) | Access via `self.provider` property |

### Logging Standards
- Always use `logging.getLogger(__name__)` — never `print()`.
- Format: `"Action description | key=value key2=value2"` — pipe-separated structured fields.
- Prefix with `[trace_id]` when a trace ID is available.
- Levels: `info` for normal flow, `warning` for degraded/fallback paths, `error` for failures.
- Never log sensitive data (file contents, API keys, full prompts in production).

### General Rules
- Use `snake_case` for all Python files, functions, variables.
- Use `PascalCase` for all classes.
- Use `UPPER_SNAKE_CASE` for constants (`MAX_FILE_SIZE`, `ALLOWED_EXTENSIONS`, `PROMPT_VERSION`).
- Type hints on all function signatures — use `str | None` syntax (not `Optional[str]`).
- ABC + `@abstractmethod` for all base classes (`LLMProvider`, `BaseDocumentParser`, `BaseWorkflow`).
- Lazy initialization via `@property` for expensive resources (LLM provider).
- Pydantic `Field(description="...")` on all schema fields.
- Singleton pattern at module bottom: `ai_content_service = AIContentService()`.
- `async def` for all I/O methods (DB, LLM, file parsing).
- Keep imports organized: stdlib → third-party → project (`app.*`).

---

## Phase 1: Observability (Tasks 1–3)

### Task 1 — Add Structured Logging to the AI Module
- [ ] Done

**Files to touch:**
- `app/ai/providers/openai_provider.py`
- `app/ai/tools/parsers/router.py`
- `app/ai/workflows/quiz_pipeline.py`

**What to do:**
1. Add `logger = logging.getLogger(__name__)` at the top of each file.
2. In `openai_provider.py` → `generate_response()`:
   - Log before the API call: model name, temperature, prompt length (`len(prompt)`), whether `response_model` is set.
   - Log after the API call: response length, time taken (use `time.monotonic()` before/after).
   - Log token usage from `response.usage.prompt_tokens` and `response.usage.completion_tokens` (wrap in `try/except AttributeError` since not all providers return this).
   - Log at `warning` level if markdown stripping was triggered.
3. In `router.py` → `parse_file()`:
   - Log which parser was selected and the file extension.
   - Log extracted text length after parsing.
   - Log at `warning` level if empty text is detected from a PDF.
4. In `quiz_pipeline.py` → `run()`:
   - Log at the start: filename, difficulty, num_questions.
   - Log after each step: "Step 1 complete: extracted {n} chars", "Step 2 complete: corrected text confidence={score}", "Step 3 complete: generated {n} questions", "Step 4 complete: quality score={score}".
   - Log total pipeline duration.

**Verify:** Run a quiz generation and check your terminal/log output shows all the messages flowing through.

---

### Task 2 — Add Correlation ID (Trace ID) Across the Pipeline
- [ ] Done

**Files to touch:**
- `app/ai/workflows/quiz_pipeline.py`
- `app/tasks/ai_content.py`

**What to do:**
1. In `ai_content.py`, at the start of the `runner()` function, generate a `trace_id` using `uuid.uuid4().hex[:12]`.
2. Pass `trace_id` into `QuizGenerationPipeline.run()` as a new parameter.
3. In `quiz_pipeline.py`, accept `trace_id: str = ""` in the `run()` method signature.
4. Prefix every log message in the pipeline with `[trace_id]` so all logs from one request can be filtered together.
5. Store the `trace_id` in the `meta_info` JSON field on `AISourceContent` when saving results back in the Celery task.

**Verify:** Run a generation → grep logs for the trace_id → all 4 pipeline steps should appear.

---

### Task 3 — Track Token Usage & Cost
- [ ] Done

**Files to touch:**
- `app/ai/providers/openai_provider.py`
- `app/ai/workflows/quiz_pipeline.py`
- `app/models/ai_content.py` (extend `meta_info` usage)

**What to do:**
1. Make `generate_response()` return a tuple `(result, usage_dict)` instead of just the result. The `usage_dict` should be `{"prompt_tokens": int, "completion_tokens": int, "total_tokens": int}`. If the API doesn't return usage, default to zeros.
   - **Alternative (less disruptive):** Store usage on `self.last_usage` as an instance attribute after each call, and read it from the pipeline.
2. In `quiz_pipeline.py`, after each of the 3 LLM calls, collect the usage data into a `token_usage` dict like:
   ```
   {"text_correction": {...}, "quiz_generation": {...}, "quality_check": {...}, "total_tokens": sum}
   ```
3. Return this usage dict alongside the 3 existing return values (or attach it to the return tuple).
4. In the Celery task, store the token usage inside `meta_info` on the source content record.

**Verify:** After a generation, query the DB and check `meta_info` contains token counts per step.

---

## Phase 2: Input Validation & Security (Tasks 4–5)

### Task 4 — File Upload Validation
- [ ] Done

**Files to touch:**
- `app/api/v1/endpoints/ai_quizzes.py`

**What to do:**
1. Define constants at the top of the file:
   - `MAX_FILE_SIZE = 10 * 1024 * 1024` (10MB)
   - `ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md", ".png", ".jpg", ".jpeg"}`
   - `ALLOWED_MIME_TYPES = {"application/pdf", "text/plain", "text/markdown", "image/png", "image/jpeg"}`
2. In `generate_quiz_from_file()`, **before** reading the file:
   - Extract the extension from `file.filename` using `os.path.splitext()`.
   - If extension not in `ALLOWED_EXTENSIONS`, raise `HTTPException(400, "Unsupported file type: {ext}")`.
3. **After** `content = await file.read()`:
   - Check `len(content) > MAX_FILE_SIZE` → raise `HTTPException(413, "File exceeds 10MB limit")`.
   - Optionally check `file.content_type` against `ALLOWED_MIME_TYPES` (note: MIME from client can be spoofed, so this is defense-in-depth, not primary).
4. Validate `difficulty` is one of `["easy", "medium", "hard"]` → raise 400 if not.
5. Validate `num_questions` is between 1 and 30 → raise 400 if not.

**Verify:** Try uploading a `.exe` file, a 20MB file, and `difficulty=extreme` — all should be rejected with clear error messages.

---

### Task 5 — Content Length Validation After Extraction
- [ ] Done

**Files to touch:**
- `app/ai/workflows/quiz_pipeline.py`

**What to do:**
1. After Step 1 (text extraction), add two checks:
   - If `len(raw_text.strip()) < 100` characters → raise `ValueError("Extracted text is too short to generate meaningful questions (minimum 100 characters).")`.
   - If `len(raw_text) > 500_000` characters → raise `ValueError("Document is too large. Please upload a shorter document or split it into sections.")`. (This is a safety net until you implement chunking in Phase 4.)
2. Log the character count at `info` level.

**Verify:** Upload a near-empty text file (e.g., "Hello") and a huge file — both should fail gracefully with descriptive messages.

---

## Phase 3: Pipeline Status Tracking (Tasks 6–8)

### Task 6 — Add Status & Error Fields to AISourceContent
- [ ] Done

**Files to touch:**
- `app/models/ai_content.py`
- Then run Alembic migration

**What to do:**
1. Add these new columns to `AISourceContent`:
   - `status: Mapped[str] = mapped_column(String(50), default="queued", nullable=False)` — values: `queued`, `parsing`, `correcting`, `generating`, `auditing`, `completed`, `failed`
   - `error_message: Mapped[str | None] = mapped_column(Text, nullable=True)`
   - `celery_task_id: Mapped[str | None] = mapped_column(String(255), nullable=True)`
2. Generate migration: `alembic revision --autogenerate -m "add_status_fields_to_ai_source_content"`
3. Apply: `alembic upgrade head`

**Verify:** Check the migration SQL looks correct, run it, confirm columns exist in DB.

---

### Task 7 — Update Celery Task to Track Pipeline Status
- [ ] Done

**Files to touch:**
- `app/tasks/ai_content.py`
- `app/services/ai_content.py`

**What to do:**
1. In `ai_content_service.initiate_quiz_generation()`:
   - After dispatching the Celery task, capture the `AsyncResult` from `.delay()`.
   - Update the source content record with `celery_task_id = result.id`.
   - Commit.
2. In the Celery task `runner()`:
   - Create a helper: fetch the source content, update its `status` field, commit. You'll call this before each pipeline step.
   - Before parsing: set status to `"parsing"`.
   - Before text correction: set status to `"correcting"`.
   - Before quiz generation: set status to `"generating"`.
   - Before quality audit: set status to `"auditing"`.
   - After all steps succeed: set status to `"completed"`.
   - In the `except` block: set status to `"failed"` and save the error message in `error_message` field.
   - **Important:** The status updates need their own `db.commit()` calls (not just one at the end), so progress is visible in real-time.

**Verify:** Start a generation, rapidly query the DB (or add a temp print statement) — you should see the status changing through the stages.

---

### Task 8 — Status Polling Endpoint
- [ ] Done

**Files to touch:**
- `app/api/v1/endpoints/ai_quizzes.py`
- `app/schemas/ai_content.py` (add a response schema)
- `app/services/ai_content.py`

**What to do:**
1. Add a new Pydantic response schema `AIGenerationStatusResponse` with fields: `public_id`, `status`, `error_message`, `celery_task_id`, `created_at`.
2. Add a new service method `get_generation_status(db, public_id)` that returns the source content record (or just the status fields).
3. Add a new endpoint:
   ```
   GET /ai-quizzes/status/{source_public_id}
   ```
   - Fetch the source content by `public_id`.
   - Return `{"success": true, "data": {"status": "generating", "error_message": null, ...}}`.
   - If status is `"completed"`, also include the `draft_quiz_public_id` so the frontend can navigate to the review page.
4. Apply read permission: `PermissionChecker("quiz", "read")`.

**Verify:** Start a generation → poll the status endpoint every 2 seconds → watch it transition from `queued` → `parsing` → ... → `completed`.

---

## Phase 4: Large Document Support (Tasks 9–10)

### Task 9 — Build a Text Chunker Utility
- [ ] Done

**Files to touch:**
- Create new file: `app/ai/tools/text_chunker.py`

**What to do:**
1. Create a class `TextChunker` with a method `chunk(text: str, max_chars: int = 12000, overlap_chars: int = 500) -> list[str]`.
2. Logic:
   - If `len(text) <= max_chars`, return `[text]` (no chunking needed).
   - Otherwise, split by paragraphs first (`\n\n`). Walk through paragraphs accumulating into a chunk until `max_chars` is reached. Start the next chunk with the last `overlap_chars` characters of the previous chunk for context continuity.
   - Never split mid-sentence if possible (try splitting on `.` + space as a fallback if a single paragraph exceeds `max_chars`).
3. Keep it simple — character-based is fine for now. Token-based (tiktoken) can be a future enhancement.

**Verify:** Write a quick test: feed it a 30,000 char string → should return 3 chunks with ~500 char overlap between them.

---

### Task 10 — Integrate Chunking into the Pipeline
- [ ] Done

**Files to touch:**
- `app/ai/workflows/quiz_pipeline.py`

**What to do:**
1. Import `TextChunker` in the pipeline.
2. After Step 2 (text correction), chunk the `corrected_text`:
   ```
   chunks = TextChunker().chunk(corrected_text_obj.corrected_text)
   ```
3. If only 1 chunk → proceed as before (no change).
4. If multiple chunks → loop: generate a quiz per chunk (Step 3), requesting `ceil(num_questions / len(chunks))` questions per chunk. Collect all `QuizOutput` objects.
5. Merge: combine all questions from all chunk outputs into a single `QuizOutput`. Deduplicate by checking if any `question_text` values are >80% similar (simple approach: lowercase + compare).
6. Trim to exactly `num_questions` if you got more than requested.
7. Run the quality audit (Step 4) on the merged output — only once, not per chunk.
8. Log how many chunks were processed and how many questions survived deduplication.

**Verify:** Upload a large multi-page PDF → check logs show multiple chunks → final quiz has the correct number of deduplicated questions.

---

## Phase 5: AI Output Validation (Tasks 11–12)

### Task 11 — Build a Quiz Output Validator
- [x] Done

**Files to touch:**
- Create new file: `app/ai/tools/quiz_validator.py`

**What to do:**
1. Create a class `QuizOutputValidator` with a method `validate(quiz: QuizOutput, expected_num: int) -> tuple[bool, list[str]]` that returns `(is_valid, list_of_issues)`.
2. Validation rules:
   - Each question must have exactly 4 options → issue: `"Question {i} has {n} options instead of 4"`.
   - `correct_option` must exactly match one of the `options` → issue: `"Question {i} correct_option doesn't match any option"`.
   - No two options within the same question should be identical → issue: `"Question {i} has duplicate options"`.
   - No two questions should have identical `question_text` → issue: `"Questions {i} and {j} are duplicates"`.
   - Question count should match `expected_num` → issue (warning level, not a hard fail): `"Expected {n} questions, got {m}"`.
   - `question_text` should not be empty or just whitespace.
   - `explanation` should not be empty.
3. Return `is_valid = len(issues) == 0`.

**Verify:** Manually create a `QuizOutput` with a bad `correct_option` and run it through — should catch the issue.

---

### Task 12 — Auto-Retry on Validation Failure
- [x] Done

**Files to touch:**
- `app/ai/workflows/quiz_pipeline.py`

**What to do:**
1. After Step 3 (quiz generation), run `QuizOutputValidator.validate(quiz_output_obj, num_questions)`.
2. If invalid:
   - Log the issues at `warning` level.
   - Build a correction prompt: take the original generation prompt + append the issues as feedback → ask the LLM to regenerate fixing those specific problems.
   - Re-call `generate_response()` with this correction prompt.
   - Re-validate. If still invalid after **2 total attempts**, log at `error` level but proceed with whatever you have (don't crash).
3. Log whether the quiz passed validation on first try, second try, or was accepted despite issues.

**Verify:** This is hard to trigger naturally. You can test by temporarily adding a fake validation rule that always fails on the first attempt, then confirm the retry fires.

---

## Phase 6: Resilience (Tasks 13–15)

### Task 13 — Add Timeout to LLM Calls
- [x] Done

**Files to touch:**
- `app/ai/providers/openai_provider.py`

**What to do:**
1. Add a `timeout` parameter to the `OpenAIProvider.__init__()` (default `60` seconds).
2. Pass `timeout=httpx.Timeout(self.timeout)` when creating the `AsyncOpenAI` client. The OpenAI SDK accepts a `timeout` parameter directly:
   ```
   self.client = AsyncOpenAI(api_key=..., base_url=..., timeout=self.timeout)
   ```
3. Catch `openai.APITimeoutError` in `generate_response()` → log it → re-raise so the Celery retry mechanism picks it up.
4. Optionally make the timeout configurable via settings: `LLM_TIMEOUT=60`.

**Verify:** Set timeout to 1 second temporarily, make a request → should raise timeout error and Celery should retry.

---

### Task 14 — Provider-Level Retry with Backoff
- [x] Done

**Files to touch:**
- `app/ai/providers/openai_provider.py`

**What to do:**
1. Install `tenacity` (add to `pyproject.toml`).
2. Wrap the `generate_response()` method with a retry decorator:
   - Retry on: `openai.APITimeoutError`, `openai.APIConnectionError`, `openai.RateLimitError`, `openai.InternalServerError`.
   - Max 3 attempts.
   - Exponential backoff: wait 2, 4, 8 seconds.
   - Log each retry attempt at `warning` level.
3. Do the same for `generate_stream_response()`.
4. Non-retryable errors (like `openai.AuthenticationError`, `openai.BadRequestError`) should **not** be retried — they'll propagate up immediately.

**Verify:** Temporarily point `LLM_BASE_URL` to a bad host → should see 3 retry attempts in logs before final failure.

---

### Task 15 — Graceful Degradation in Pipeline
- [x] Done

**Files to touch:**
- `app/ai/workflows/quiz_pipeline.py`

**What to do:**
1. Wrap Step 4 (quality audit) in a `try/except`. If the audit fails:
   - Log at `error` level: `"Quality audit failed, proceeding without audit: {error}"`.
   - Create a default `QualityReport` with `score=0, is_passing=False, issues=["Audit could not be performed"], suggestions=[]`.
   - Continue — don't crash the whole pipeline.
2. Similarly for Step 2 (text correction): if it fails, fall back to using the raw extracted text as-is. Create a default `CorrectedText` with `corrected_text=raw_text, confidence_score=0.0, corrections_made=["Text correction failed, using raw text"]`.
3. Step 3 (quiz generation) is the only non-skippable step — if this fails, the pipeline should still fail.

**Verify:** Temporarily break the quality check prompt to produce invalid JSON → pipeline should complete with the default "unaudited" report instead of crashing.

---

## Phase 7: Document Format Support (Tasks 16–17)

### Task 16 — DOCX Parser
- [x] Done

**Files to touch:**
- Create: `app/ai/tools/parsers/docx_parser.py`
- Update: `app/ai/tools/parsers/router.py`
- Update: `app/api/v1/endpoints/ai_quizzes.py` (add `.docx` to allowed extensions)

**What to do:**
1. Install `python-docx` (add to `pyproject.toml`).
2. Create `DocxParser(BaseDocumentParser)` with `async def parse(self, file_bytes: bytes) -> str`:
   - Write bytes to a `BytesIO` stream.
   - Open with `docx.Document(stream)`.
   - Extract text from all paragraphs: `"\n".join(p.text for p in doc.paragraphs if p.text.strip())`.
   - Also extract text from tables if any: iterate `doc.tables`, then rows, then cells.
3. Register in `ParserRouter`: `".docx": DocxParser()`.
4. Add `".docx"` and `"application/vnd.openxmlformats-officedocument.wordprocessingml.document"` to the allowed lists in the endpoint.

**Verify:** Upload a `.docx` file with mixed paragraphs and a table → extracted text should contain content from both.

---

### Task 17 — Scanned PDF OCR Fallback
- [x] Done

**Files to touch:**
- `app/ai/tools/parsers/router.py`

**What to do:**
1. Currently, if a PDF yields empty text, you raise `ValueError("This PDF appears to be scanned...")`.
2. Change this: instead of raising, fall back to the `ImageVisionParser`:
   - Re-open the PDF with `fitz`.
   - For each page, render it as an image using `page.get_pixmap()` → get the PNG bytes.
   - Pass each page's PNG bytes through `ImageVisionParser.parse()`.
   - Concatenate the extracted text from all pages.
3. Log at `info` level: `"PDF has no searchable text, falling back to vision-based OCR for {n} pages"`.
4. This will be slow for many pages. Add a cap: only OCR the first 10 pages max. Log a warning if the document has more.

**Verify:** Find or create a scanned PDF (screenshot a page, save as PDF) → upload it → should extract text via vision instead of erroring.

---

## Phase 8: Prompt Engineering (Tasks 18–19)

### Task 18 — Add Few-Shot Examples to Prompts
- [x] Done

**Files to touch:**
- `app/ai/prompts/templates/quiz_generation.py`

**What to do:**
1. Add 1-2 gold-standard example questions to the `SYSTEM_PROMPT`, after the rules section. Format as:
   ```
   Here is an example of a perfect question:
   {"question_text": "What is the primary function of...", "options": ["A...", "B...", "C...", "D..."], "correct_option": "B...", "explanation": "B is correct because..."}
   ```
2. Use a generic educational topic (like biology or history) so it doesn't bias toward any specific domain.
3. Keep it to 1-2 examples max — more will waste tokens.
4. Do the same for `quality_check.py` — show an example of a good audit output.

**Verify:** Generate a quiz and compare output quality vs. before. Few-shot examples typically improve format consistency significantly.

---

### Task 19 — Store Prompt Version with Each Generation
- [x] Done

**Files to touch:**
- `app/ai/prompts/templates/__init__.py`
- `app/ai/workflows/quiz_pipeline.py`
- `app/models/ai_content.py` (extend `meta_info`)

**What to do:**
1. In `app/ai/prompts/templates/__init__.py`, define a constant: `PROMPT_VERSION = "1.0"`.
2. In the pipeline, after completion, include `"prompt_version": PROMPT_VERSION` in the data saved to `meta_info`.
3. When you update prompts in the future, bump this version.
4. This creates an audit trail: you can query which prompt version produced which quizzes and compare quality over time.

**Verify:** Run a generation → check `meta_info` in DB → should contain `"prompt_version": "1.0"`.

---

## Phase 9: Testing (Tasks 20–22)

### Task 20 — Unit Tests for Parsers
- [x] Done

**Files to touch:**
- Create: `tests/unit/ai/test_parsers.py`
- Create fixture files in: `tests/fixtures/` (a small PDF, a `.txt`, a `.docx`)

**What to do:**
1. Create a small PDF fixture (1-2 pages with known text).
2. Create a `.txt` fixture with known content.
3. Write tests:
   - `test_pdf_parser_extracts_text` — parse the fixture PDF → assert known text appears in output.
   - `test_text_parser_utf8` — parse UTF-8 text → assert exact match.
   - `test_text_parser_latin1_fallback` — parse Latin-1 encoded bytes → should not crash.
   - `test_router_rejects_unsupported_extension` — pass a `.exe` filename → assert `ValueError`.
   - `test_router_selects_correct_parser` — pass `.pdf` → assert `PDFParser` is used (check via the router's internal dict).

**Verify:** `pytest tests/unit/ai/test_parsers.py -v` — all green.

---

### Task 21 — Unit Tests for Quiz Validator
- [x] Done

**Files to touch:**
- Create: `tests/unit/ai/test_quiz_validator.py`

**What to do:**
1. Test cases to write:
   - `test_valid_quiz_passes` — a perfect `QuizOutput` → `is_valid=True, issues=[]`.
   - `test_wrong_option_count_fails` — a question with 3 options → caught.
   - `test_correct_option_not_in_options_fails` — `correct_option="X"` but X not in options → caught.
   - `test_duplicate_options_fails` — two identical options in one question → caught.
   - `test_duplicate_questions_fails` — two questions with identical text → caught.
   - `test_empty_question_text_fails` — `question_text=""` → caught.
2. Use Pydantic models directly — no mocking needed.

**Verify:** `pytest tests/unit/ai/test_quiz_validator.py -v` — all green.

---

### Task 22 — Mock-Based Pipeline Test
- [x] Done

**Files to touch:**
- Create: `tests/unit/ai/test_quiz_pipeline.py`

**What to do:**
1. Use `unittest.mock.AsyncMock` to mock the LLM provider.
2. Mock `get_llm_provider()` to return your mock provider.
3. Configure the mock's `generate_response()` to return pre-built `CorrectedText`, `QuizOutput`, and `QualityReport` objects for each call.
4. Test:
   - `test_pipeline_runs_all_four_steps` — call `pipeline.run()` with a small text file → assert `generate_response` was called exactly 3 times.
   - `test_pipeline_raises_on_empty_text` — pass empty bytes → assert `ValueError`.
   - `test_pipeline_returns_correct_types` — assert return types are the 3 Pydantic models.
5. You're testing the **orchestration logic**, not the LLM — that's the point.

**Verify:** `pytest tests/unit/ai/test_quiz_pipeline.py -v` — all green.

---

## Phase 10: Rate Limiting & Quotas (Task 23)

### Task 23 — Rate Limit the Generate Endpoint
- [x] Done

**Files to touch:**
- `app/api/v1/endpoints/ai_quizzes.py`
- Optionally create: `app/core/rate_limiter.py`

**What to do:**
1. Install `slowapi` (add to `pyproject.toml`), or implement a simple Redis-based rate limiter using your existing Redis connection.
2. Apply a rate limit to `POST /ai-quizzes/generate`: **5 requests per minute per user**.
3. The simplest approach with `slowapi`:
   - Create a `Limiter` instance with the Redis backend.
   - Use `@limiter.limit("5/minute")` on the endpoint.
   - Extract the key from the authenticated user (not IP, since this is behind auth).
4. Return `429 Too Many Requests` with a clear message: `"Rate limit exceeded. Please wait before generating another quiz."`.

**Verify:** Hit the generate endpoint 6 times rapidly → 6th request should return 429.

---

## Completion Checklist

| Phase | Tasks | Status |
|---|---|---|
| 1. Observability | Tasks 1-3 | ✅ |
| 2. Input Validation | Tasks 4-5 | ✅ |
| 3. Status Tracking | Tasks 6-8 | ✅ |
| 4. Large Doc Support | Tasks 9-10 | ✅ |
| 5. Output Validation | Tasks 11-12 | ✅ |
| 6. Resilience | Tasks 13-15 | ✅ |
| 7. Format Support | Tasks 16-17 | ✅ |
| 8. Prompt Engineering | Tasks 18-19 | ✅ |
| 9. Testing | Tasks 20-22 | ✅ |
| 10. Rate Limiting | Task 23 | ✅ |

> [!IMPORTANT]
> **Estimated total effort:** ~20-25 hours across all 23 tasks. Each task is 30-90 minutes.
> Do Phase 1-3 first — they're the foundation everything else builds on.
