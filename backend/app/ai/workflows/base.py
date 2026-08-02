from abc import ABC, abstractmethod
from typing import Any


class BaseWorkflow(ABC):
    @abstractmethod
    async def run(self, *args: Any, **kwargs: Any) -> Any:
        pass
