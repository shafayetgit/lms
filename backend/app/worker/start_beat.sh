#!/usr/bin/env bash
set -euo pipefail

export PYTHONPATH="${PYTHONPATH:-.}"

APP_MODULE="${CELERY_APP_MODULE:-app.core.celery:celery_app}"
LOGLEVEL="${CELERY_LOGLEVEL:-info}"

exec celery -A "${APP_MODULE}" beat --loglevel "${LOGLEVEL}"
