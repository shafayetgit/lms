"""
Celery tasks package.

Celery autodiscovery imports this package. Keep task modules imported here so
they get registered with the Celery app.
"""

from app.core.celery import celery_app as _celery_app  # noqa: F401

from app.tasks import debug  # noqa: F401
from app.tasks import emails  # noqa: F401
