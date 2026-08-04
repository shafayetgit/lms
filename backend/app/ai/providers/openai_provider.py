import logging
import time
from collections.abc import AsyncGenerator
from typing import Any

import openai
from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.ai.providers.base import LLMProvider, T

logger = logging.getLogger(__name__)


def log_retry(retry_state):
    logger.warning(
        "LLM call failed, retrying | attempt=%d error=%r",
        retry_state.attempt_number,
        retry_state.outcome.exception(),
    )


class OpenAIProvider(LLMProvider):
    def __init__(
        self,
        api_key: str,
        base_url: str | None,
        model: str = "gemma4:31b-cloud",
        timeout: float = 60.0,
    ):
        self.client = AsyncOpenAI(api_key=api_key, base_url=base_url, timeout=timeout)
        self.model = model
        self.timeout = timeout
        # Stores token usage from the last generate_response call
        self.last_usage: dict[str, int] = {}

    @retry(
        reraise=True,
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=8),
        retry=retry_if_exception_type((
            openai.APITimeoutError,
            openai.APIConnectionError,
            openai.RateLimitError,
            openai.InternalServerError,
        )),
        before_sleep=log_retry,
    )
    async def generate_response(
        self,
        prompt: str,
        system_prompt: str | None = None,
        response_model: type[T] | None = None,
        temperature: float = 0.3,
        max_tokens: int | None = None,
        **kwargs: Any,
    ) -> Any:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        prompt_len = sum(len(m["content"]) if isinstance(m["content"], str) else 0 for m in messages)
        logger.info(
            "LLM request | model=%s temp=%.1f prompt_chars=%d structured=%s",
            self.model, temperature, prompt_len, response_model is not None,
        )

        start = time.monotonic()

        try:
            if response_model is not None:
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    response_format={"type": "json_object"},
                    temperature=temperature,
                    max_tokens=max_tokens,
                    **kwargs,
                )
                elapsed = time.monotonic() - start
                self._log_usage(response, elapsed)

                raw_content = response.choices[0].message.content
                raw_content = raw_content.strip()
                if raw_content.startswith("```"):
                    logger.warning("Markdown fences detected in LLM response, stripping")
                    raw_content = raw_content.split("\n", 1)[1]
                    raw_content = raw_content.rsplit("```", 1)[0]
                    raw_content = raw_content.strip()
                return response_model.model_validate_json(raw_content)

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs,
            )
            elapsed = time.monotonic() - start
            self._log_usage(response, elapsed)

            return response.choices[0].message.content
        except openai.APITimeoutError as e:
            logger.error("LLM request timed out | model=%s timeout=%.1fs error=%s", self.model, self.timeout, str(e))
            raise

    def _log_usage(self, response, elapsed: float) -> None:
        """Extract and log token usage from the API response."""
        try:
            usage = response.usage
            self.last_usage = {
                "prompt_tokens": usage.prompt_tokens or 0,
                "completion_tokens": usage.completion_tokens or 0,
                "total_tokens": usage.total_tokens or 0,
            }
            logger.info(
                "LLM response | time=%.2fs prompt_tokens=%d completion_tokens=%d total_tokens=%d",
                elapsed, self.last_usage["prompt_tokens"],
                self.last_usage["completion_tokens"], self.last_usage["total_tokens"],
            )
        except (AttributeError, TypeError):
            self.last_usage = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            logger.info("LLM response | time=%.2fs tokens=unavailable", elapsed)

    @retry(
        reraise=True,
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=8),
        retry=retry_if_exception_type((
            openai.APITimeoutError,
            openai.APIConnectionError,
            openai.RateLimitError,
            openai.InternalServerError,
        )),
        before_sleep=log_retry,
    )
    async def generate_stream_response(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.3,
        max_tokens: int | None = None,
        **kwargs: Any,
    ) -> AsyncGenerator[str, None]:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        logger.info("LLM stream request | model=%s temp=%.1f", self.model, temperature)
        start = time.monotonic()

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
                **kwargs,
            )
            async for chunk in response:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
        except openai.APITimeoutError as e:
            logger.error("LLM stream request timed out | model=%s timeout=%.1fs error=%s", self.model, self.timeout, str(e))
            raise

        logger.info("LLM stream complete | time=%.2fs", time.monotonic() - start)
