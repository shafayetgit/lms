import logging
import os

from app.ai.tools.parsers.base import BaseDocumentParser
from app.ai.tools.parsers.image_parser import ImageVisionParser
from app.ai.tools.parsers.pdf_parser import PDFParser
from app.ai.tools.parsers.text_parser import TextParser
from app.ai.tools.parsers.docx_parser import DocxParser

logger = logging.getLogger(__name__)


class ParserRouter:
    def __init__(self):
        self.parsers: dict[str, BaseDocumentParser] = {
            ".pdf": PDFParser(),
            ".txt": TextParser(),
            ".md": TextParser(),
            ".docx": DocxParser(),
            ".png": ImageVisionParser(mime_type="image/png"),
            ".jpg": ImageVisionParser(mime_type="image/jpeg"),
            ".jpeg": ImageVisionParser(mime_type="image/jpeg"),
        }

    async def parse_file(self, filename: str, file_bytes: bytes) -> str:
        _, ext = os.path.splitext(filename.lower())
        parser = self.parsers.get(ext)
        if not parser:
            logger.error("No parser found for extension: %s", ext)
            raise ValueError(f"Unsupported file extension: {ext}")

        logger.info(
            "Parsing file | name=%s ext=%s parser=%s size=%d bytes",
            filename, ext, type(parser).__name__, len(file_bytes),
        )
        extracted_text = await parser.parse(file_bytes)

        if ext == ".pdf" and not extracted_text.strip():
            logger.warning("PDF produced empty text — likely scanned | file=%s", filename)
            
            import fitz
            ocr_texts = []
            with fitz.open(stream=file_bytes, filetype="pdf") as doc:
                num_pages = len(doc)
                pages_to_ocr = min(num_pages, 10)
                
                logger.info(
                    "PDF has no searchable text, falling back to vision-based OCR for %d pages",
                    pages_to_ocr
                )
                if num_pages > 10:
                    logger.warning("PDF has %d pages, capping OCR to first 10 pages", num_pages)
                
                vision_parser = self.parsers[".jpg"]
                for i in range(pages_to_ocr):
                    page = doc[i]
                    pix = page.get_pixmap()
                    jpg_bytes = pix.tobytes("jpeg")
                    logger.info(
                        "PDF page %d/%d rendered | %dx%d | %d bytes",
                        i + 1, pages_to_ocr, pix.width, pix.height, len(jpg_bytes),
                    )
                    page_text = await vision_parser.parse(jpg_bytes)
                    if page_text:
                        ocr_texts.append(page_text)
            
            extracted_text = "\n".join(ocr_texts)
            if not extracted_text.strip():
                raise ValueError("This PDF appears to be scanned or contains only images, and OCR could not extract any text.")

        logger.info("Parsing complete | extracted_chars=%d", len(extracted_text))
        return extracted_text

