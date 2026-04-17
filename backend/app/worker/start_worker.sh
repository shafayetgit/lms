#!/usr/bin/env bash
set -euo pipefail

export PYTHONPATH="${PYTHONPATH:-.}"

APP_MODULE="${CELERY_APP_MODULE:-app.core.celery:celery_app}"
LOGLEVEL="${CELERY_LOGLEVEL:-info}"
CONCURRENCY="${CELERY_CONCURRENCY:-1}"
QUEUES="${CELERY_QUEUES:-default}"

exec celery -A "${APP_MODULE}" worker \
  --loglevel "${LOGLEVEL}" \
  --concurrency "${CONCURRENCY}" \
  --queues "${QUEUES}"
