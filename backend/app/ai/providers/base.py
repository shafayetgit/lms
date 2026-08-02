from typing import AsyncGenerator
from pydantic import BaseModel
from typing import TypeVar
from typing import Type
from typing import Optional
from typing import Any
from abc import ABC, abstractmethod

T = TypeVar("T", bound=BaseModel)

class LLMProvider(ABC):

    @abstractmethod
    async def generate_response(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,  
        response_model: Optional[Type[T]] = None,
        temperature: float = 0.3,
        max_tokens: Optional[int] = None,
        **kwargs: Any
    ) -> Any:
        pass

    @abstractmethod
    async def generate_stream_response(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        response_model: Optional[Type[T]] = None,
        temperature: float = 0.3,
        max_tokens: Optional[int] = None,
        **kwargs: Any
    ) -> AsyncGenerator[str, None]:
        pass
    