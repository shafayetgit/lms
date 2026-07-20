import re
import unicodedata

from app import models


def slugify(text: str) -> str:
    """
    Convert a string to a URL-friendly slug, supporting Unicode (like Bengali).
    """
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-')


def get_model(model_name: str):
    """
    Get the model class based on the model name.
    Example: "Course" -> Course
    """
    import types
    
    # 1. Try fetching directly
    model = getattr(models, model_name, None)
    if model is not None and not isinstance(model, types.ModuleType):
        return model

    # 2. Normalize to PascalCase (e.g. "course_progress" -> "CourseProgress")
    parts = model_name.split("_")
    pascal_name = "".join(part.capitalize() for part in parts)
    
    # 3. Try with normalized PascalCase name
    model = getattr(models, pascal_name, None)
    if model is not None and not isinstance(model, types.ModuleType):
        return model

    # 4. If we got a module, try to fetch the class from inside it.
    raw_attr = getattr(models, model_name.lower(), None)
    if isinstance(raw_attr, types.ModuleType):
        class_obj = getattr(raw_attr, pascal_name, None)
        if class_obj is not None:
            return class_obj

    return None