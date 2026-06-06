# LMS Project — Agent Rules

> **These rules are the authoritative guide for any AI agent working on this codebase.**
> Read them entirely before writing or modifying any code.

---

## 1. Project Overview

This is a full-stack **Learning Management System (LMS)** codenamed **"Elite LMS"**.

| Layer | Stack |
|---|---|
| **Frontend** | Next.js 16 (App Router, Turbopack), React 19, MUI v9, Redux Toolkit / RTK Query, Formik + Yup, Framer Motion |
| **Backend** | FastAPI (fully async), SQLAlchemy 2 (async), Alembic, Pydantic v2, PostgreSQL 16, Redis 7, Celery |
| **Auth** | JWT (access + refresh tokens), Argon2 password hashing, OTP (email/SMS/TOTP), role-based (admin / instructor / student) |
| **Infra** | Docker Compose (postgres, redis, backend, worker, beat), uv package manager (backend) |

### Monorepo Layout

```
lms/
├── frontend/          # Next.js 16 application
│   └── src/
│       ├── app/       # App Router pages & layouts
│       │   ├── (portal)/   # Public-facing portal (auth, courses, about, etc.)
│       │   ├── admin/      # Admin dashboard
│       │   └── student/    # Student dashboard
│       ├── components/     # Shared reusable components
│       │   ├── form/       # CTextField, CSelect, CPasswordField, etc.
│       │   ├── ui/         # CButton, CForm, CDialog, CPageLoader, etc.
│       │   ├── table/      # Data-grid components
│       │   ├── layout/     # Layout partials (Topbar, Sidebar, etc.)
│       │   └── actions/    # Action-related components
│       ├── features/       # RTK Query API slices (one folder per domain)
│       ├── redux/          # Store, reducers, middleware, hooks, provider
│       ├── schema/         # Yup validation schemas
│       ├── choices/        # Static enum/choice data
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Auth utilities, Cloudinary, HTTP helpers, constants
│       ├── theme/          # MUI theme (light.js is the active theme)
│       └── utils/          # Shared utility functions
├── backend/           # FastAPI application
│   └── app/
│       ├── api/v1/endpoints/  # Route handlers (thin layer — call services)
│       ├── services/          # Business logic
│       ├── repositories/      # Database access (no business logic)
│       ├── schemas/           # Pydantic request/response schemas
│       ├── models/            # SQLAlchemy ORM models
│       ├── core/              # Config, security, dependencies, exceptions, responses
│       ├── db/                # Database session & base model
│       ├── integrations/      # Third-party integrations
│       ├── tasks/             # Celery async tasks
│       ├── worker/            # Celery worker/beat startup
│       ├── templates/         # Email HTML templates (Jinja2)
│       └── tests/             # Pytest test suites
└── docs/              # Architecture docs, DB diagrams, setup guides
```

---

## 2. Architecture — The Golden Rule

### Backend: Clean Architecture

```
Client → Endpoint → Service → Repository → Database
```

- **Endpoints** (`api/v1/endpoints/`): Thin HTTP layer. Define routes, call services, return responses. **No business logic here.**
- **Services** (`services/`): All business logic, validation, orchestration. Call repositories and raise `HTTPException` when needed.
- **Repositories** (`repositories/`): Pure database access. CRUD operations only — no business rules, no HTTP exceptions.
- **Models** (`models/`): SQLAlchemy ORM models. Define tables, relationships, constraints.
- **Schemas** (`schemas/`): Pydantic v2 models for request/response validation. Follow the naming pattern: `<Module>Base`, `<Module>Create`, `<Module>Read`, `<Module>Update`.

### Frontend: Feature-Based Architecture

```
Page → Component → RTK Query Hook → API → Backend
```

- **Pages** (`app/`): Next.js App Router pages. Compose components and use RTK Query hooks.
- **Components** (`components/`): Reusable UI pieces. Always use the existing `C`-prefixed component library.
- **Features** (`features/`): RTK Query API slices. One folder per domain, inject endpoints into the shared `api` instance.
- **Redux** (`redux/`): Centralized store setup. Single `api` instance with tag-based cache invalidation.

---

## 3. Frontend Rules

### 3.1 Path Aliases

Always use the `@/` alias for imports (maps to `./src/`):

```js
// ✅ Correct
import CButton from "@/components/ui/CButton";
import { useReadCoursesQuery } from "@/features/course/courseAPI";

// ❌ Wrong
import CButton from "../../components/ui/CButton";
```

### 3.2 Component Library — Use Existing `C`-Prefixed Components

This project has a custom component library. **Always use these before reaching for raw MUI components:**

| Component | Location | Purpose |
|---|---|---|
| `CButton` | `components/ui/CButton.jsx` | Buttons with action-based icons & confirmation dialogs |
| `CForm` | `components/ui/CForm.jsx` | Form wrapper with title, submit button, floating FAB |
| `CTextField` | `components/form/CTextField.jsx` | Standard text input |
| `CPasswordField` | `components/form/CPasswordField.jsx` | Password input with toggle |
| `CSelect` | `components/form/CSelect.jsx` | Dropdown select |
| `CAutocomplete` | `components/form/CAutocomplete.jsx` | Searchable autocomplete |
| `CNumberField` | `components/form/CNumberField.jsx` | Numeric input |
| `CDatePicker` | `components/form/CDatePicker.jsx` | Date picker |
| `CTimePicker` | `components/form/CTimePicker.jsx` | Time picker |
| `CCheckbox` | `components/form/CCheckbox.jsx` | Checkbox |
| `CRadioGroup` | `components/form/CRadioGroup.jsx` | Radio group |
| `CFileField` | `components/form/CFileField.jsx` | File upload |
| `CPhoneField` | `components/form/CPhoneField.jsx` | Phone number input |
| `CSearchField` | `components/form/CSearchField.jsx` | Search input |
| `CDialog` | `components/ui/CDialog.jsx` | Modal dialog |
| `CPageLoader` | `components/ui/CPageLoader.jsx` | Full-page loading state |
| `CError` | `components/ui/CError.jsx` | Error display |
| `CToaster` | `components/ui/CToaster.jsx` | Toast notifications (react-toastify) |

### 3.3 RTK Query API Slices

All API communication uses **RTK Query** via a single shared `api` instance at `redux/api.js`.

**Pattern for creating a new feature API:**

```js
// features/<module>/<module>API.js
import api from "@/redux/api";

const PREFIX = "api/v1/<module>";

const <module>API = api.injectEndpoints({
  endpoints: (builder) => ({
    create<Module>: builder.mutation({
      query: (body) => ({ url: PREFIX, method: "POST", body }),
      invalidatesTags: ["<TAG>"],
    }),
    read<Module>s: builder.query({
      query: (params) => {
        const searchParams = new URLSearchParams();
        // ... build query string from params
        const qs = searchParams.toString();
        return qs ? `${PREFIX}/?${qs}` : PREFIX;
      },
      providesTags: ["<TAG>"],
    }),
    read<Module>: builder.query({
      query: ({ id }) => `${PREFIX}/${id}`,
    }),
    update<Module>: builder.mutation({
      query: ({ id, body }) => ({ url: `${PREFIX}/${id}`, method: "PUT", body }),
      invalidatesTags: ["<TAG>"],
    }),
    delete<Module>: builder.mutation({
      query: ({ id }) => ({ url: `${PREFIX}/${id}`, method: "DELETE" }),
      invalidatesTags: ["<TAG>"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreate<Module>Mutation,
  useRead<Module>sQuery,
  useLazyRead<Module>sQuery,
  useRead<Module>Query,
  useUpdate<Module>Mutation,
  useDelete<Module>Mutation,
} = <module>API;
export default <module>API;
```

**Rules:**
- Register new tag types in `redux/api.js` `tagTypes` array.
- Use `providesTags` / `invalidatesTags` for cache management.
- Prefix all URLs with `api/v1/`.
- Export individual hooks AND the default API object.
- File naming: `<module>API.js` (camelCase with `API` suffix).

### 3.4 Validation Schemas

- Located in `schema/<module>.js`.
- Use **Yup** for validation (the project uses both Yup and Zod — Yup is the primary standard for Formik forms).
- Export named schemas: `export const <module>ValidationSchema = Yup.object().shape({...})`.

### 3.5 Form Handling

- Use **Formik** for form state management with Yup validation.
- Use **react-hook-form** + **Zod** only if explicitly requested or if an existing page already uses it.
- Always use the `CForm` wrapper component for consistent styling.

### 3.6 Theming & Styling

- The active theme is `theme/light.js` — a custom MUI theme with the **"Elite"** design system.
- **Always use theme tokens** — never hardcode colors. Use `theme.palette.*`, `alpha()`, etc.
- Typography: `DM Sans` (primary) and `JetBrains Mono` (code).
- Use `useTheme()` hook or `sx` prop with theme callbacks for dynamic styling.
- Animations use **Framer Motion** (`motion` components, `AnimatePresence`).
- Design aesthetic: Premium, glassmorphic, dark-mode-ready, with micro-animations.

### 3.7 Authentication (Frontend)

- Tokens stored in cookies (`accessToken`, `refreshToken`).
- Auto-refresh logic is in `features/baseQuery.js` — transparent 401 retry with token refresh.
- Auth utilities in `lib/auth/`.
- Cookie helpers in `utils/shared.js` (`getCookie`).
- Redirect to `/auth/sign-in` on auth failure.

### 3.8 Page Structure

- **Portal** `(portal)/`: Public pages — auth, courses catalog, about, contact, FAQ, etc. Uses its own layout.
- **Admin** `admin/`: Admin dashboard with sidebar layout. Module management pages under `admin/<module>/`.
- **Student** `student/`: Student dashboard with `StudentLayout.jsx`. Profile, enrolled courses, orders, etc.
- Partials go in `_partials/` subdirectories within each section.
- Shared page-level components go in `_components/`.

### 3.9 Client vs Server Components

- Mark client components with `"use client"` directive at the top.
- Any component using hooks (`useState`, `useEffect`, `useTheme`, RTK Query hooks, Formik, Framer Motion) **must** be a client component.
- Keep server components for static/layout pages where possible.

### 3.10 Dev Server

```bash
cd frontend && npm run dev  # Uses Turbopack
```

---

## 4. Backend Rules

### 4.1 Module Development Flow

When creating a new module, follow this exact order:

1. **Model** → `models/<module>.py` — SQLAlchemy model
2. **Schema** → `schemas/<module>.py` — Pydantic schemas (`Base`, `Create`, `Read`, `Update`)
3. **Repository** → `repositories/<module>.py` — DB access functions
4. **Service** → `services/<module>.py` — Business logic
5. **Endpoint** → `api/v1/endpoints/<module>.py` — Route handlers
6. **Router** → Register in `api/v1/api.py` — Include the router
7. **Migration** → `alembic revision --autogenerate -m "..."` then `alembic upgrade head`

### 4.2 Async Everything

- **All** database operations use async SQLAlchemy (`AsyncSession`).
- **All** endpoint functions are `async def`.
- Use `await` for all DB queries.
- Database driver: `asyncpg` (PostgreSQL).

### 4.3 Dependencies (Dependency Injection)

Located in `core/dependencies.py`:

| Dependency | Usage |
|---|---|
| `get_db` | Provides `AsyncSession` — use `db: AsyncSession = Depends(get_db)` |
| `get_current_user` | Validates JWT, returns `User` object |
| `get_current_active_user` | Same + checks `is_active` |
| `get_admin_or_instructor` | Same + checks role is ADMIN or INSTRUCTOR |

### 4.4 Response Format

Use the standardized response helpers from `core/responses.py`:

```python
from app.core.responses import create_response, read_response, update_response, delete_response, error_response

# GET:    return read_response(data=...)
# POST:   return create_response(data=..., message="...")
# PUT:    return update_response(data=..., message="...")
# DELETE: return delete_response(message="...")
# ERROR:  return error_response(message="...", status_code=400)
```

All responses follow the envelope format:
```json
{ "success": true|false, "data": {...}, "message": "..." }
```

### 4.5 Exception Handling

- Global exception handlers are registered in `core/exceptions.py`.
- Validation errors return camelCase field names (automatic snake→camel conversion).
- Use `HTTPException` for business-rule violations in the service layer.
- Never raise raw Python exceptions in endpoints.

### 4.6 Configuration

- **Environment variables**: `.env` file — database URLs, secrets, API keys.
- **Project settings**: `project_settings.yaml` — feature flags, rate limits, CORS, security policies, provider config.
- **Settings class**: `core/config.py` — Pydantic Settings model.
- **Project settings loader**: `core/project_settings.py` — YAML-based configuration.

### 4.7 Database Migrations

```bash
cd backend

# Create a migration
alembic revision --autogenerate -m "description of change"

# Apply migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

- Always import new models in `models/__init__.py` so Alembic detects them.
- Review auto-generated migrations before applying.

### 4.8 User Roles

Three roles defined in `UserRole` enum:
- `admin` — Full platform management
- `instructor` — Course/content management
- `student` — Course consumption (default role)

### 4.9 Background Tasks

- Use **Celery** for async/heavy operations (email sending, processing, etc.).
- Tasks go in `tasks/` directory.
- Worker started via `app/worker/start_worker.sh`.
- Beat scheduler via `app/worker/start_beat.sh`.
- Broker & result backend: Redis.

### 4.10 Running the Backend

```bash
cd backend

# Start dependencies
docker compose up -d redis db

# Run the API server
uv run fastapi dev --host 0.0.0.0

# Or run everything with Docker
docker compose up
```

---

## 5. API Contract

- **Base URL**: `http://localhost:8000`
- **API prefix**: `/api/v1`
- **Auth header**: `Authorization: Bearer <access_token>`
- **Content-Type**: `application/json` (default), `multipart/form-data` (file uploads)
- **Pagination**: Query params `page`, `size` — response includes `total`, `items`

---

## 6. Naming Conventions

### Backend (Python)

| Element | Convention | Example |
|---|---|---|
| Files | `snake_case.py` | `course.py`, `quiz_attempt.py` |
| Classes | `PascalCase` | `CourseCreate`, `UserRole` |
| Functions | `snake_case` | `get_course_by_id()` |
| Variables | `snake_case` | `current_user` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_ATTEMPTS` |
| Router prefix | `kebab-case` | `/quiz-attempts` |
| Tags | `Title Case` | `"Quiz Attempts"` |

### Frontend (JavaScript/JSX)

| Element | Convention | Example |
|---|---|---|
| Components | `PascalCase.jsx` | `CButton.jsx`, `CourseCard.jsx` |
| Utility files | `camelCase.js` | `courseAPI.js`, `baseQuery.js` |
| Custom hooks | `use<Name>.jsx` | `useScrollBackgroundColor.jsx` |
| RTK slices | `<module>API.js` | `courseAPI.js`, `quizAPI.js` |
| Schemas | `<module>.js` | `course.js`, `auth.js` |
| CSS/Theme | `camelCase.js` | `light.js` |
| Folders | `kebab-case` | `support-ticket/`, `quiz-attempts/` |
| RTK tag types | `UPPER_SNAKE_CASE` | `"COURSES"`, `"SUPPORT_TICKETS"` |
| Custom components | `C` prefix | `CButton`, `CTextField`, `CForm` |

---

## 7. Do's and Don'ts

### ✅ Do

- Use the existing `C`-prefixed component library for all forms and UI elements.
- Use `@/` path alias for all imports.
- Use theme tokens — never hardcode colors.
- Follow the Clean Architecture layers (endpoint → service → repository).
- Use the standardized response helpers (`create_response`, `read_response`, etc.).
- Use `injectEndpoints` on the shared `api` instance for new RTK Query slices.
- Register new API tags in `redux/api.js`.
- Write `async` functions for all backend operations.
- Use `Depends()` for dependency injection in FastAPI endpoints.
- Run Alembic migrations after model changes.
- Use Formik + Yup for form validation (primary pattern).
- Mark interactive components with `"use client"`.

### ❌ Don't

- Don't put business logic in endpoints — that belongs in the service layer.
- Don't put HTTP concerns (status codes, exceptions) in repositories.
- Don't create new `createApi()` instances — always use `injectEndpoints` on the existing `api`.
- Don't use raw MUI `<TextField>`, `<Button>`, `<Select>` when a `C`-prefixed wrapper exists.
- Don't hardcode API URLs — use the `NEXT_PUBLIC_API_BASE_URL` env var via the base query.
- Don't use `getServerSideProps` or `getStaticProps` — this is App Router (use server components or client-side fetching).
- Don't skip Alembic migrations — never modify the database schema directly.
- Don't install dependencies without checking if they already exist in `package.json` / `pyproject.toml`.
- Don't create duplicate utility functions — check `utils/shared.js` and `utils/` first.
- Don't leave `copy` files (e.g., `light copy.js`) — clean up or ignore them.

---

## 8. Environment Variables

### Frontend (`frontend/.env`)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL (e.g., `http://localhost:8000`) |
| `NEXT_PUBLIC_CLOUDINARY_*` | Cloudinary config for image/media uploads |

### Backend (`backend/.env`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL async connection string |
| `REDIS_URL` | Redis connection string |
| `SECRET_KEY` | JWT signing key |
| `ALGORITHM` | JWT algorithm (default: HS256) |
| `CELERY_BROKER_URL` | Celery broker (Redis) |
| `CELERY_RESULT_BACKEND` | Celery result store (Redis) |
| `SMTP_*` / `SENDGRID_*` | Email provider config |
| `TWILIO_*` | SMS provider config |

---

## 9. Testing

### Backend

```bash
cd backend
uv run pytest                    # Run all tests
uv run pytest app/tests/ -v     # Verbose
uv run pytest -k "test_auth"    # Run specific tests
```

- Tests use `pytest` + `pytest-asyncio`.
- Test files in `app/tests/`.
- Use `httpx.AsyncClient` for API integration tests.

### Frontend

```bash
cd frontend
npm run build    # Type-check & build validation
npm run lint     # ESLint
```

---

## 10. Key Domain Modules

| Module | Backend Models | Frontend Feature |
|---|---|---|
| Users | `user.py` | `features/user/` |
| Auth | (in user model) | `features/auth/` |
| Courses | `course.py` | `features/course/` |
| Categories | `category.py` | `features/category/` |
| Modules | `module.py` | `features/module/` |
| Lessons | `lesson.py` | `features/lesson/` |
| Quizzes | `quiz.py` | `features/quiz/` |
| Questions | `question.py` | (in quiz feature) |
| Quiz Attempts | `quiz_attempt.py` | (in quiz feature) |
| Enrollments | `enrollment.py` | (in shared) |
| Reviews | `review.py` | (in shared) |
| Discussions | `discussion.py` | (in shared) |
| Comments | `comment.py` | (in shared) |
| Media | `media.py` | `features/media/` |
| Wishlist | `wishlist.py` | (in shared) |
| Instructors | (user with role) | `features/instructor/` |
| Course Progress | `course_progress.py` | (in shared) |
| Lesson Progress | `lesson_progress.py` | (in shared) |
