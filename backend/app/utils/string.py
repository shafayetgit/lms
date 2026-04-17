import re
import unicodedata

def slugify(text: str) -> str:
    """
    Convert a string to a URL-friendly slug.
    Example: "Machine Learning 101" -> "machine-learning-101"
    """
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')
