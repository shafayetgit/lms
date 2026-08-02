import fitz
from app.ai.tools.parsers.base import BaseDocumentParser


class PDFParser(BaseDocumentParser):
    async def parse(self, file_bytes: bytes) -> str:
        text_content = []
        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            for page in doc:
                text = page.get_text()
                if text:
                    text_content.append(text)
        return "\n".join(text_content)
