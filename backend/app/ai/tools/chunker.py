import logging

logger = logging.getLogger(__name__)


class TextChunker:
    """
    Splits long documents into smaller, overlapping chunks on natural boundaries
    (paragraphs, lines, sentences, words) to fit LLM context limits.
    """

    def __init__(self, separators: list[str] | None = None):
        self.separators = separators or ["\n\n", "\n", ". ", " ", ""]

    def split_text(
        self, text: str, chunk_size: int = 8000, chunk_overlap: int = 1000
    ) -> list[str]:
        """
        Split a string into chunks of maximum size `chunk_size` with overlap `chunk_overlap`.
        """
        if not text or not text.strip():
            return []

        if chunk_overlap >= chunk_size:
            raise ValueError(
                f"chunk_overlap ({chunk_overlap}) cannot be greater than or equal to chunk_size ({chunk_size})"
            )

        logger.info(
            "Splitting text | length=%d chunk_size=%d chunk_overlap=%d",
            len(text),
            chunk_size,
            chunk_overlap,
        )

        return self._split_recursive(text, self.separators, chunk_size, chunk_overlap)

    def _split_recursive(
        self, text: str, separators: list[str], chunk_size: int, chunk_overlap: int
    ) -> list[str]:
        if len(text) <= chunk_size:
            return [text]

        # Find the first separator that exists in the text
        separator = ""
        next_separators = []
        for i, sep in enumerate(separators):
            if sep == "":
                separator = sep
                next_separators = separators[i + 1 :]
                break
            if sep in text:
                separator = sep
                next_separators = separators[i + 1 :]
                break

        # Split the text
        if separator != "":
            splits = text.split(separator)
        else:
            splits = list(text)

        chunks = []
        current_doc = []
        current_len = 0

        for split in splits:
            split_to_add = split + separator if separator != "" else split

            if len(split_to_add) > chunk_size:
                # Flush current doc first
                if current_doc:
                    chunks.append(separator.join(current_doc))
                    current_doc = []
                    current_len = 0

                # Split the large segment recursively using next separators
                if next_separators:
                    sub_chunks = self._split_recursive(
                        split, next_separators, chunk_size, chunk_overlap
                    )
                    chunks.extend(sub_chunks)
                else:
                    # No more separators, force-slice
                    for i in range(0, len(split), chunk_size - chunk_overlap):
                        chunks.append(split[i : i + chunk_size])
            else:
                # Check if adding split exceeds chunk_size
                candidate_len = current_len + len(split_to_add)
                if candidate_len <= chunk_size:
                    current_doc.append(split)
                    current_len = candidate_len
                else:
                    # Flush current doc
                    if current_doc:
                        chunks.append(separator.join(current_doc))

                    # Satisfy overlap requirements by backtracking
                    overlap_doc = []
                    overlap_len = 0
                    for d in reversed(current_doc):
                        d_to_add = d + separator if separator != "" else d
                        if overlap_len + len(d_to_add) <= chunk_overlap:
                            overlap_doc.insert(0, d)
                            overlap_len += len(d_to_add)
                        else:
                            break

                    current_doc = overlap_doc
                    current_doc.append(split)
                    current_len = overlap_len + len(split_to_add)

        if current_doc:
            chunks.append(separator.join(current_doc))

        # Filter out empty chunks and clean up whitespaces
        final_chunks = []
        for chunk in chunks:
            stripped = chunk.strip()
            if stripped:
                final_chunks.append(stripped)

        return final_chunks
