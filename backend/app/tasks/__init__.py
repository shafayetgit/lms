"""
Celery tasks package.

Celery autodiscovery imports this package. Keep task chapters imported here so
they get registered with the Celery app.
"""

from app.core.celery import celery_app as _celery_app  # noqa: F401
from app.tasks import (
    ai_content,  # noqa: F401
    ai_quizzes,  # noqa: F401
    debug,  # noqa: F401
    emails,  # noqa: F401
)
