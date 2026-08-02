from abc import ABC, abstractmethod


class BaseDocumentParser(ABC):
    @abstractmethod
    async def parse(self, file_bytes: bytes) -> str:
        pass
