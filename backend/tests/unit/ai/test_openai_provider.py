from unittest.mock import AsyncMock, patch
import pytest
import httpx
import openai
from app.ai.providers.openai_provider import OpenAIProvider


@pytest.mark.asyncio
async def test_openai_provider_timeout_config():
    provider = OpenAIProvider(api_key="fake-key", base_url="fake-url", timeout=12.5)
    assert provider.timeout == 12.5
    assert provider.client.timeout == 12.5


@pytest.mark.asyncio
async def test_openai_provider_retry_on_timeout():
    provider = OpenAIProvider(api_key="fake-key", base_url="fake-url")

    mock_response = AsyncMock()
    mock_response.choices = [AsyncMock()]
    mock_response.choices[0].message.content = "Perfect answer"
    mock_response.usage.prompt_tokens = 5
    mock_response.usage.completion_tokens = 2
    mock_response.usage.total_tokens = 7

    # Mock chat.completions.create to raise timeout error first, then succeed
    with patch.object(
        provider.client.chat.completions, "create", new_callable=AsyncMock
    ) as mock_create:
        mock_request = httpx.Request(
            "POST", "https://api.openai.com/v1/chat/completions"
        )
        mock_create.side_effect = [
            openai.APITimeoutError(request=mock_request),
            mock_response,
        ]

        # Use 0 wait to keep test fast
        with patch("tenacity.wait_exponential", return_value=lambda state: 0):
            res = await provider.generate_response(prompt="Test prompt")
            assert res == "Perfect answer"
            assert mock_create.call_count == 2
