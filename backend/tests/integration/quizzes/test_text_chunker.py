import pytest
from app.ai.tools.chunker import TextChunker


def test_text_chunker_simple():
    text = "Hello world.\n\nThis is a second paragraph.\n\nAnd a third one."
    chunker = TextChunker()
    # Simple split by paragraph separator
    chunks = chunker.split_text(text, chunk_size=35, chunk_overlap=10)
    assert len(chunks) == 3
    assert chunks[0] == "Hello world."
    assert chunks[1] == "This is a second paragraph."
    assert chunks[2] == "And a third one."


def test_text_chunker_fallback_to_sentence():
    # Single paragraph falling back to sentence splitting
    text = "Sentence one. Sentence two. Sentence three."
    chunker = TextChunker()
    chunks = chunker.split_text(text, chunk_size=20, chunk_overlap=5)
    assert len(chunks) == 3
    assert chunks[0] == "Sentence one"
    assert chunks[1] == "Sentence two"
    assert chunks[2] == "Sentence three."


def test_text_chunker_overlap():
    text = "Paragraph one is here.\n\nParagraph two is also here."
    chunker = TextChunker()
    chunks = chunker.split_text(text, chunk_size=30, chunk_overlap=15)
    assert len(chunks) >= 2
    for c in chunks:
        assert len(c) <= 30


def test_text_chunker_validation():
    chunker = TextChunker()
    with pytest.raises(ValueError):
        chunker.split_text("test", chunk_size=10, chunk_overlap=10)


def test_text_chunker_empty_input():
    chunker = TextChunker()
    chunks = chunker.split_text("", chunk_size=10, chunk_overlap=2)
    assert chunks == []
