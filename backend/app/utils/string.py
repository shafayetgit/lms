import re
import unicodedata

from app import models


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


def get_model(model_name: str):
    """
    Get the model class based on the model name.
    Example: "Course" -> Course
    """
    model = getattr(models, model_name, None)
    
    return model