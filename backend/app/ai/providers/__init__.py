from app.ai.providers.base import LLMProvider
from app.ai.providers.openai_provider import OpenAIProvider
from app.core.config import init_settings


def get_llm_provider() -> LLMProvider:
    settings = init_settings()

    if not settings.LLM_PROVIDER:
        raise ValueError("LLM_PROVIDER is not set")

    if not settings.LLM_BASE_URL:
        raise ValueError("LLM_BASE_URL is not set")

    if not settings.LLM_API_KEY:
        raise ValueError("LLM_API_KEY is not set")

    if not settings.LLM_MODEL:
        raise ValueError("LLM_MODEL is not set")

    if settings.LLM_PROVIDER == "openai":
        return OpenAIProvider(
            api_key=settings.LLM_API_KEY,
            base_url=settings.LLM_BASE_URL,
            model=settings.LLM_MODEL,
            timeout=settings.LLM_TIMEOUT,
        )

    raise ValueError(f"Unsupported LLM provider: {settings.LLM_PROVIDER}")
