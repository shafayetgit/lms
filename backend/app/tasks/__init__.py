"""
Celery tasks package.

Celery autodiscovery imports this package. Keep task chapters imported here so
they get registered with the Celery app.
"""

from app.core.celery import celery_app as _celery_app
from app.tasks import (
    ai_content,
    ai_quizzes,
    debug,
    emails,
)
