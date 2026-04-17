# LMS Backend

A production-ready FastAPI-based Learning Management System backend with comprehensive authentication, email verification, SMS 2FA, OAuth2 integrationand async PostgreSQL support.

## ✨ Features

### Authentication & Security
- **Email Verification** - OTP-based email verification with Redis storage
- **Forgot Password** - Secure password reset with OTP
- **2FA (Two-Factor Authentication)** - Three methods: Email OTP, SMS OTP, TOTP
- **OAuth2 Login** - Google and GitHub integration with multi-provider support
- **Password Hashing** - Argon2 with pwdlib (industry standard)
- **JWT Tokens** - Access & refresh tokens with expiry
- **Account Lockout** - Auto-lock after failed login attempts
- **Login Tracking** - Track failed attempts and last login

### User Management
- **Role-Based Access** - Admin, Instructor, Student with polymorphic inheritance
- **User Profiles** - Comprehensive profile fields with preferences
- **Phone Verification** - Optional phone number with SMS 2FA
- **Email Notifications** - HTML email templates for all auth events
- **Privacy & Security** - Email/phone availability checks

### Email & SMS Integration
- **Multi-Email Provider** - SMTP or SendGrid (flexible switching)
- **Professional HTML Templates** - Verification, password reset, 2FA emails
- **SMS Delivery** - Twilio integration for SMS OTP
- **Template Engine** - Jinja2 for dynamic email content
- **Async Sending** - Non-blocking email/SMS operations

### Database & API
- **PostgreSQL + SQLAlchemy 2.0** - Async ORM with modern patterns
- **Database Migrations** - Alembic for schema versioning
- **RESTful API** - 21+ comprehensive endpoints
- **OpenAPI/Swagger** - Auto-generated API documentation
- **Async Throughout** - Full async/await architecture
- **Proper Error Handling** - Consistent HTTP error responses

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | FastAPI | 0.115+ |
| **Database** | PostgreSQL | 12+ |
| **ORM** | SQLAlchemy | 2.0+ |
| **Validation** | Pydantic | 2.8+ |
| **Auth** | JWT + OAuth2 | - |
| **Password Hashing** | Argon2 (pwdlib) | - |
| **Email** | aiosmtplib / SendGrid | - |
| **SMS** | Twilio | - |
| **2FA** | pyotp (TOTP) | - |
| **OTP Storage** | Redis | 7.4+ |
| **Rate Limiting** | slowapi | - |
| **Migrations** | Alembic | 1.14+ |
| **Server** | Uvicorn | 0.42+ |
| **Async HTTP** | httpx | 0.28+ |

## Prerequisites

- **Python 3.10+** (Tested on 3.14)
- **PostgreSQL 12+**
- **Redis** (for OTP storage)
- **uv** or **pip** for package management

## 📚 Documentation

Essential documentation is organized in the `docs/` folder:

1. **[01_QUICKSTART.md](docs/01_QUICKSTART.md)** - Start the project in 5 minutes
2. **[02_SETUP.md](docs/02_SETUP.md)** - Complete setup guide (database, email, SMS, OAuth, credentials)
3. **[03_ARCHITECTURE.md](docs/03_ARCHITECTURE.md)** - System architecture, design patternsand structure
4. **[04_PROJECT_SETTINGS.md](docs/04_PROJECT_SETTINGS.md)** - Administrator project configuration guide
5. **[05_CELERY.md](docs/05_CELERY.md)** - Background tasks with Celery (worker + beat)

## Quick Start

### 1. Setup Environment

```bash
# Clone or navigate to backend directory
cd backend

# Option A: Using uv (recommended)
uv sync

# Option B: Using pip
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration:
# - Database credentials
# - Email provider settings
# - SMS/Twilio credentials  
# - OAuth provider keys
# - Redis connection
```

### 3. Setup Database

```bash
# Run migrations
alembic upgrade head

# Verify schema
psql -U your_user -d your_database -c "\dt"
```

### 4. Start Server

```bash
fastapi dev
# Or production mode:
fastapi run
```

Server runs on `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`


### 3. Configure Environment

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/lms
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
```

### 4. Run Database Migrations

```bash
# Create initial database
createdb lms

# Apply all migrations
alembic upgrade head

# Create a new migration after model changes
alembic revision --autogenerate -m "your migration message"
```

### 5. Start the Development Server

**Option 1: Using FastAPI CLI (Recommended)**
```bash
fastapi dev
```

**Option 2: Using Uvicorn**
```bash
uvicorn app.main:app --reload --port 8000
```

The server runs at: `http://localhost:8000`

**API Documentation:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 6. Using Docker (Optional)

```bash
docker-compose up
```

This will:
- Start PostgreSQL container
- Build and start the FastAPI backend
- Apply migrations automatically
- Expose API at `http://localhost:8000`

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/token` - Login and get access token
- `GET /api/v1/auth/me` - Get current user info

### Users

- `GET /api/v1/users/me` - Get logged-in user details
- `GET /api/v1/users/{user_id}` - Get user by ID
- `PUT /api/v1/users/{user_id}` - Update user information

### Health

- `GET /health` - Health check endpoint

## Project Structure

```
app/
├── api/
│   ├── v1/
│   │   ├── endpoints/
│   │   │   ├── auth.py      # Authentication endpoints
│   │   │   └── users.py     # User management endpoints
│   │   └── api.py           # API router setup
│   └── deps.py              # Dependencies
├── core/
│   ├── config.py            # Configuration management
│   ├── security.py          # JWT and password utilities
│   └── dependencies.py
├── db/
│   ├── base.py              # SQLAlchemy base
│   └── session.py           # Database session setup
├── models/
│   └── user.py              # User model
├── repositories/
│   └── user.py              # Data access layer
├── schemas/
│   └── user.py              # Pydantic schemas
├── services/
│   └── user.py              # Business logic
└── main.py                  # Application entry point
```

## Development Workflow

### Database Changes

1. Modify schema in `app/models/`
2. Generate migration: `alembic revision --autogenerate -m "message"`
3. Apply migration: `alembic upgrade head`

### Adding New Endpoints

1. Create model in `app/models/`
2. Create schema in `app/schemas/`
3. Create repository functions in `app/repositories/`
4. Create service logic in `app/services/`
5. Create endpoint in `app/api/v1/endpoints/`
6. Register router in `app/api/v1/api.py`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | Required |
| SECRET_KEY | JWT secret key | Required |
| ALGORITHM | JWT algorithm | HS256 |
| ACCESS_TOKEN_EXPIRE_MINUTES | Token expiry time | 30 |
| DEBUG | Debug mode | False |
| APP_TITLE | Application title | LMS Backend |

## Testing

Create a new migration for tests:
```bash
alembic revision --autogenerate -m "create users table"
alembic upgrade head
```

## Production Deployment

Before deploying:

1. Set `DEBUG=False` in `.env`
2. Use a strong `SECRET_KEY`
3. Configure CORS origins in `app/main.py`
4. Use environment-specific `.env` files
5. Set up proper database backups
6. Enable HTTPS

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Check database credentials

### Migration Issues
```bash
# Reset database (development only)
alembic downgrade base
alembic upgrade head
```

### Authentication Issues
- Ensure SECRET_KEY matches between token creation and validation
- Check token expiration time
- Verify user's `is_active` status
