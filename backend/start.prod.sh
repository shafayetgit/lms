#!/bin/sh
set -e

# Run database migrations
python -m alembic upgrade head

# Run LMS initial setup and seeding
python app/commands/setup_lms.py

# Create superadmin if environment variables are provided
if [ -n "$SUPERADMIN_USERNAME" ] && [ -n "$SUPERADMIN_EMAIL" ] && [ -n "$SUPERADMIN_PASSWORD" ]; then
    python manage.py createsuperadmin \
        --username "$SUPERADMIN_USERNAME" \
        --email "$SUPERADMIN_EMAIL" \
        --password "$SUPERADMIN_PASSWORD" \
        --first-name "${SUPERADMIN_FIRST_NAME:-Shafayet}" \
        --last-name "${SUPERADMIN_LAST_NAME:-Haydar}"
fi

# Start the FastAPI application
fastapi run --host 0.0.0.0 --port "$PORT" --proxy-headers --forwarded-allow-ips '*'
