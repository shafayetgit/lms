import base64
import logging

from app.ai.providers import get_llm_provider
from app.ai.tools.parsers.base import BaseDocumentParser

logger = logging.getLogger(__name__)

# Max pixel dimension on longest side for vision OCR
MAX_VISION_DIMENSION = 1024


class ImageVisionParser(BaseDocumentParser):
    def __init__(self, mime_type: str = "image/png"):
        self.mime_type = mime_type
        self._provider = None

    @property
    def provider(self):
        if self._provider is None:
            self._provider = get_llm_provider()
        return self._provider

    @staticmethod
    def _compress_for_vision(file_bytes: bytes, original_mime: str) -> tuple[bytes, str]:
        """Downscale and JPEG-compress image for efficient LLM vision processing."""
        import math

        import fitz

        pix = fitz.Pixmap(file_bytes)
        orig_w, orig_h, orig_size = pix.width, pix.height, len(file_bytes)
        was_shrunk = False

        # shrink(n) divides each dimension by 2^n, find smallest n where max_dim/2^n <= 1024
        max_dim = max(orig_w, orig_h)
        if max_dim > MAX_VISION_DIMENSION:
            n = math.ceil(math.log2(max_dim / MAX_VISION_DIMENSION))
            if n >= 1:
                pix.shrink(n)
                was_shrunk = True

        # JPEG cannot encode alpha — drop it
        if pix.alpha:
            pix = fitz.Pixmap(pix, 0)

        compressed = pix.tobytes("jpeg")

        # Only use JPEG if it actually reduces size or image was downscaled
        if len(compressed) < orig_size or was_shrunk:
            logger.info(
                "Image compressed for vision | %dx%d → %dx%d | %d → %d bytes",
                orig_w, orig_h, pix.width, pix.height, orig_size, len(compressed),
            )
            return compressed, "image/jpeg"

        logger.info(
            "Image kept as original (JPEG larger) | %dx%d | %d bytes",
            orig_w, orig_h, orig_size,
        )
        return file_bytes, original_mime

    async def parse(self, file_bytes: bytes) -> str:
        # Compress and downscale for the LLM
        try:
            file_bytes, mime = self._compress_for_vision(file_bytes, self.mime_type)
        except Exception as e:
            logger.warning("Image compression failed, sending original: %s", e)
            mime = self.mime_type

        base64_data = base64.b64encode(file_bytes).decode("utf-8")
        logger.info(
            "Sending vision request | payload=%d bytes | base64=%d chars",
            len(file_bytes), len(base64_data),
        )

        prompt = [
            {
                "type": "text",
                "text": "Extract all readable text from this image. Do not add any extra explanations or introduction. Return ONLY the transcribed text from the image, preserving the original formatting as closely as possible.",
            },
            {
                "type": "image_url",
                "image_url": {"url": f"data:{mime};base64,{base64_data}"},
            },
        ]
        response = await self.provider.generate_response(prompt=prompt, temperature=0.1)
        return response or ""
