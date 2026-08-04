from app.ai.tools.parsers.base import BaseDocumentParser


class TextParser(BaseDocumentParser):
    async def parse(self, file_bytes: bytes) -> str:
        try:
            return file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            return file_bytes.decode("latin-1")
