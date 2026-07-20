# Learning Management System (LMS)

A modern, enterprise-grade, fullstack Learning Management System built with a **FastAPI (Async Python)** backend and a **Next.js (React 19 / MUI v9)** frontend.

---

## 🚀 Key Features

### 🎓 Learning Management & Education
- **Courses & Programs**: Create, publish, and manage multi-chapter courses, curriculum programs, and content structures.
- **Interactive Quizzes & Assignments**: Auto-graded and instructor-graded assessments with submission tracking.
- **Certificates & Badges**: Automatic certificate generation upon completion and gamified badge issuance.
- **Live Classes**: Integration for scheduled virtual classroom sessions.
- **Progress Tracking**: Real-time student course progression and statistics analytics.

### 🔐 Security, Auth & Access Control
- **Multi-Role Access Control (RBAC)**: Fine-grained permission architecture (`PermissionGuard`) supporting Admins, Instructors, and Students.
- **Authentication & OAuth2**: Email/Password authentication alongside Google & GitHub OAuth2 providers.
- **Two-Factor Authentication (2FA)**: Multi-channel 2FA support via TOTP (authenticator apps), Email OTP, and SMS OTP (Twilio).
- **Session Management**: Secure JWT token pairs (access & refresh) with auto-lockout on failed attempts.

### 💳 Payments & Integrations
- **Payment Gateway Integration**: Multi-provider payment integration supporting Stripe checkout and custom gateways.
- **Notification Engine**: Dynamic HTML email templates (SendGrid/SMTP) and SMS notifications.
- **Background Task Queue**: Async background jobs powered by Celery & Redis.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Server-Side Rendering & Client Portal with Turbopack |
| **Frontend UI Core** | [Material-UI (MUI v9)](https://mui.com/) | Theme-based custom design system & data tables |
| **State Management** | [Redux Toolkit](https://redux-toolkit.js.org/) | Global state & RTK Query for API integration |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) | High-performance Python async REST API |
| **Database & ORM** | [PostgreSQL 16](https://www.postgresql.org/) + [SQLAlchemy 2.0](https://www.sqlalchemy.org/) | Async ORM & Alembic migrations |
| **Cache & Task Queue** | [Redis 7](https://redis.io/) + [Celery](https://docs.celeryq.dev/) | Session/OTP cache & background workers |
| **Package Manager** | `uv` (Backend) / `npm` (Frontend) | Fast Python dependency resolution & Node tooling |

---

## 📁 Repository Structure

```
lms/
├── backend/                  # FastAPI Application
│   ├── alembic/              # Database migration scripts
│   ├── app/                  # Application source code
│   │   ├── api/v1/           # API v1 routes & endpoints
│   │   ├── commands/         # CLI commands & database seed scripts
│   │   ├── core/             # Configuration, security, & Celery setup
│   │   ├── db/               # SQLAlchemy session & base models
│   │   ├── models/           # SQLAlchemy DB schema models
│   │   ├── repositories/     # Data access layer
│   │   ├── schemas/          # Pydantic data validation schemas
│   │   └── services/         # Business logic layer
│   ├── pyproject.toml        # Backend dependencies & scripts
│   └── start.prod.sh         # Production container entrypoint
├── frontend/                 # Next.js Application
│   ├── src/
│   │   ├── app/              # Next.js App Router (Portal & LMS dashboard)
│   │   ├── components/       # Custom design system UI components
│   │   ├── features/         # Redux slices & RTK Query APIs
│   │   └── theme/            # MUI custom light & dark theme definitions
│   └── package.json          # Frontend dependencies & scripts
├── compose.dev.yml           # Docker Compose for development/local stack
├── compose.prod.yml          # Docker Compose for production deployment
└── README.md                 # Project documentation
```

---

## 🚦 Quick Start Guide

### Prerequisites

- **Python 3.10+** (with `uv` or `pip`)
- **Node.js 18+** & `npm`
- **PostgreSQL 16**
- **Redis 7**

---

### 1. Backend Setup

```bash
cd backend

# Option A: Using uv (Recommended)
uv sync

# Option B: Using standard virtualenv
python -m venv .venv
source .venv/bin/activate
pip install -r pyproject.toml

# Environment configuration
cp .env.example .env
# Update .env with your PostgreSQL credentials & secret keys

# Run database migrations
uv run alembic upgrade head

# Start development server
uv run uvicorn app.main:app --reload --port 8001
```

Backend API Docs available at:
- **Swagger UI**: `http://localhost:8001/docs`
- **ReDoc**: `http://localhost:8001/redoc`

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Environment configuration
cp .env.example .env

# Start Next.js dev server
npm run dev
```

Frontend application available at: `http://localhost:3000`

---

### 3. Background Worker (Celery)

To process email sending, async jobs, and background processing:

```bash
cd backend
uv run celery -A app.core.celery worker -l info
```

---

## 🐳 Docker Container Deployment

To run the complete stack (Backend, Frontend, PostgreSQL, Redis, Celery Worker) using Docker Compose:

```bash
# Development / Local Docker Stack
docker compose -f compose.dev.yml up --build

# Production Docker Stack
docker compose -f compose.prod.yml up -d --build
```

---

## 🧪 Testing & Code Quality

### Backend Tests (Pytest)
```bash
cd backend
uv run pytest
```

### Frontend Code Verification
```bash
cd frontend
npm run lint
```

---

## 📄 License

This project is proprietary and confidential. All rights reserved.
