# LMS Backend Architecture Guide
Model -> Repository -> Schema -> Service -> API Endpoint
This document explains how the three main phases of the application work: Project Setup, User Setup (Registration)and Authentication (Auth Setup).

---

## Table of Contents

1. [Phase 1: Project Setup](#phase-1-project-setup)
2. [Phase 2: User Setup (Registration)](#phase-2-user-setup-registration)
3. [Phase 3: Authentication & JWT](#phase-3-authentication--jwt)
4. [Architecture Overview](#architecture-overview)
5. [Security Features](#security-features)

---

## Phase 1: Project Setup

**What happens:** The application initializes and prepares all resources before accepting requests.

### 1.1 Environment Configuration Loading

```
.env file → Pydantic Settings → Settings object
```

**File:** `app/core/config.py`

- **On startup:** Settings are lazily loaded from `.env` file using `init_settings()`
- **Key variables:**
  - `DATABASE_URL`: PostgreSQL connection string
  - `SECRET_KEY`: Used for JWT token signing
  - `ALGORITHM`: HS256 (HMAC with SHA-256)
  - `ACCESS_TOKEN_EXPIRE_MINUTES`: 30 minutes
  - `DEBUG`: Enable/disable debug logging

**Code Flow:**

```python
# app/core/config.py
from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    DATABASE_URL: str = Field(...)
    SECRET_KEY: str = Field(...)
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    DEBUG: bool = Field(default=False)
    
    class Config:
        env_file = Path(__file__).parent.parent.parent / ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

def init_settings() -> Settings:
    global settings
    if settings is None:
        settings = get_settings()
    return settings
```

**Why lazy loading?** Prevents import errors if `.env` is missing. Settings only initialize when actually needed.

### 1.2 Database Initialization

**File:** `app/db/session.py`

- **Engine Creation:** `create_async_engine()` creates a connection pool
- **Session Maker:** `async_sessionmaker()` creates database sessions on demand
- **Lazy pattern:** Engine is only created when `get_db()` is first called

**Code Flow:**

```python
# app/db/session.py
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

_engine = None
_session_maker = None

def get_engine():
    global _engine
    if _engine is None:
        settings = init_settings()
        _engine = create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,
        )
    return _engine

def get_session_maker():
    global _session_maker
    if _session_maker is None:
        engine = get_engine()
        _session_maker = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _session_maker

async def get_db():
    async_session = get_session_maker()
    async with async_session() as session:
        yield session
```

**Flow Breakdown:**
- `get_engine()` → creates async engine with connection pool
- `get_session_maker()` → creates session factory
- `get_db()` → yields new session for each request (dependency injection)

### 1.3 FastAPI App Setup

**File:** `app/main.py`

- **Lifespan Context Manager:** Handles startup and shutdown events
- **CORS Middleware:** Allows cross-origin requests for frontend clients
- **Logging Configuration:** Sets up application logging based on DEBUG flag
- **Router Registration:** Includes all API routes under `/api/v1` prefix

**Code Flow:**

```python
# app/main.py
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

settings = init_settings()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Lifespan context manager for startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event
    logger.info("Starting LMS Backend")
    yield
    # Shutdown event
    logger.info("Shutting down LMS Backend")

# Create FastAPI app with lifespan
app = FastAPI(
    title=settings.APP_TITLE,
    description="FastAPI LMS Backend",
    version="0.1.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix="/api/v1")
```

**Lifespan vs Old Pattern:**
- **New (Modern):** Uses `@asynccontextmanager` with single lifespan manager
- **Old (Deprecated):** Used `@app.on_event("startup")` and `@app.on_event("shutdown")`

### 1.4 Route Registration

**File:** `app/api/v1/api.py`

Routes included:
- `/api/v1/auth/*` - Authentication endpoints
- `/api/v1/users/*` - User management
- `/health` - Health check

**Code Flow:**

```python
# app/api/v1/api.py
from fastapi import APIRouter
from .endpoints import auth, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
```

**Available Endpoints After Startup:**
```
GET  /health                      - Health check
POST /api/v1/auth/register        - Register new user
POST /api/v1/auth/token           - Login (get access & refresh tokens)
POST /api/v1/auth/refresh         - Refresh access token
GET  /api/v1/auth/me              - Get current user info
GET  /api/v1/users/me             - Get logged-in user details
GET  /api/v1/users/{user_id}      - Get user by ID
PUT  /api/v1/users/{user_id}      - Update user information
```

---

## Phase 2: User Setup (Registration)

**What happens:** A new user creates an account through the registration endpoint.

### 2.1 API Endpoint

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "name": "John Doe",
  "password": "SecurePassword123",
  "role": "STUDENT"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "STUDENT",
  "is_active": true
}
```

### 2.2 Validation Layer (Pydantic)

**File:** `app/schemas/user.py` - `UserCreate` model

Pydantic automatically validates:
- `username`: Required string
- `email`: Valid email format (EmailStr)
- `name`: Required string
- `password`: Required string (plain text at this point)
- `role`: One of ADMIN, INSTRUCTOR, STUDENT (defaults to STUDENT)

**Code:**

```python
# app/schemas/user.py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    name: str
    password: str
    role: Optional[UserRole] = UserRole.STUDENT
```

**Validation Automatically Checks:**
- Email format is valid
- All required fields are present
- Data types match schema

### 2.3 Service Layer (Business Logic)

**File:** `app/services/user.py` - `UserService.register_user()`

**Step 1: Check username uniqueness**

```python
existing_user = await get_user_by_username(db, user_in.username)
if existing_user:
    raise ValueError("Username already exists")
```

**Step 2: Check email uniqueness**

```python
existing_email = await get_user_by_email(db, user_in.email)
if existing_email:
    raise ValueError("Email already registered")
```

**Step 3: Hash password** using Argon2/bcrypt

```python
hashed_password = get_password_hash(user_in.password)
# Never store plain password!
```

**Step 4: Create User object**

```python
user = User(
    username=user_in.username,
    email=user_in.email,
    name=user_in.name,
    hashed_password=hashed_password,
    role=user_in.role,
    is_active=True,
    created_at=datetime.now(timezone.utc)
)
```

**Step 5: Save to database**

```python
return await create_user(db, user)
```

**Complete Service Method:**

```python
# app/services/user.py
class UserService:
    @staticmethod
    async def register_user(db: AsyncSession, user_in: UserCreate) -> User:
        """Register a new user with validation."""
        # Check username uniqueness
        existing_user = await get_user_by_username(db, user_in.username)
        if existing_user:
            raise ValueError("Username already exists")
        
        # Check email uniqueness
        existing_email = await get_user_by_email(db, user_in.email)
        if existing_email:
            raise ValueError("Email already registered")
        
        # Hash password and create user
        hashed_password = get_password_hash(user_in.password)
        user = User(
            username=user_in.username,
            email=user_in.email,
            name=user_in.name,
            hashed_password=hashed_password,
            role=user_in.role,
        )
        return await create_user(db, user)
```

### 2.4 Repository Layer (Data Access)

**File:** `app/repositories/user.py`

```python
async def create_user(db: AsyncSession, user: User) -> User:
    db.add(user)           # Stage the record
    await db.commit()      # Write to database
    await db.refresh(user) # Reload to get auto-generated ID
    return user

async def get_user_by_username(db: AsyncSession, username: str) -> User | None:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalars().first()

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()
```

**Database Operations:**
1. `db.add(user)` - Stages object in session
2. `await db.commit()` - Writes changes to database
3. `await db.refresh(user)` - Reloads object to get auto-generated ID

### 2.5 Database Model

**File:** `app/models/user.py` - Implements Joined Table Inheritance Pattern

The User model uses **Single Table Inheritance (Joined Table Pattern)** for role-based users:

```python
# Base User class (all roles)
class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(100), unique=True)
    hashed_password: Mapped[str]
    role: Mapped[UserRole] = mapped_column(String(20), default=UserRole.STUDENT)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    type: Mapped[str] = mapped_column(String(20))  # Discriminator for polymorphism
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

# Student class (inherits from User)
class Student(User):
    __tablename__ = "students"
    
    id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    student_id: Mapped[str] = mapped_column(String(50), unique=True)
    enrollment_date: Mapped[Optional[datetime]]
    phone_number: Mapped[Optional[str]] = mapped_column(String(20))
    date_of_birth: Mapped[Optional[date]]
    department: Mapped[Optional[str]]

# Instructor class (inherits from User)
class Instructor(User):
    __tablename__ = "instructors"
    
    id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    qualification: Mapped[str] = mapped_column(String(200))
    specialization: Mapped[Optional[str]] = mapped_column(String(200))
    bio: Mapped[Optional[str]] = mapped_column(String(500))
    phone_number: Mapped[Optional[str]] = mapped_column(String(20))
    department: Mapped[Optional[str]]

# Admin uses base User table (no extra table needed)
```

**Database Schema:**

```sql
-- Base table for all users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  hashed_password TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'student',
  type VARCHAR(20) NOT NULL,  -- Discriminator (user/student/instructor)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIMEZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIMEZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIMEZONE
);

-- Student-specific fields
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  enrollment_date TIMESTAMP WITH TIMEZONE,
  phone_number VARCHAR(20),
  date_of_birth DATE,
  department VARCHAR(100),
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Instructor-specific fields
CREATE TABLE instructors (
  id SERIAL PRIMARY KEY,
  qualification VARCHAR(200) NOT NULL,
  specialization VARCHAR(200),
  bio VARCHAR(500),
  phone_number VARCHAR(20),
  department VARCHAR(100),
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Why Joined Table Inheritance?**

- ✅ **Scalable:** Separates role-specific data (no NULL columns)
- ✅ **Type-Safe:** Cannot access non-existent fields
- ✅ **Optimized:** Queries only needed tables
- ✅ **Flexible:** Easy to add new roles
- ✅ **Professional:** Used by Moodle, Blackboard, Canvas

### 2.6 Complete Registration Flow

```
1. Client sends POST /api/v1/auth/register with UserCreate data
   ↓
2. Pydantic validates input (email format, required fields, etc.)
   ↓
3. FastAPI dependency injection injects AsyncSession (db)
   ↓
4. register() endpoint calls register_user() service
   ↓
5. Service checks username uniqueness (query database)
   ↓
6. Service checks email uniqueness (query database)
   ↓
7. Service hashes password using Argon2/bcrypt
   ↓
8. Service creates User object
   ↓
9. Repository saves User to database
   ↓
10. Database generates auto-increment ID
    ↓
11. Service returns User object
    ↓
12. FastAPI serializes to UserRead schema
    ↓
13. Response sent to client with HTTP 201 Created
```

---

## Phase 3: Authentication & JWT

**What happens:** User logs in with credentials and receives a JWT token for accessing protected routes.

### 3.1 Login Endpoint

**Endpoint:** `POST /api/v1/auth/token`

**Request:** OAuth2PasswordRequestForm
```
Content-Type: application/x-www-form-urlencoded

username=john_doe&password=SecurePassword123
```

**Accepts Either:**
- `username=john_doe` - Login with username
- `username=john@example.com` - Login with email (flexible login)

**Note:** Uses form data (not JSON) - OAuth2 standard. The "username" field accepts both username and email for better UX.

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huX2RvZSIsImV4cCI6MTcxMTY4OTYwMH0...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huX2RvZSIsInR5cGUiOiJyZWZyZXNoIiwgImV4cCI6MTcxMjI5MzYwMH0...",
  "token_type": "bearer"
}
```

**Login Flow (with username OR email support):**
```python
# 1. Try to find user by username
user = await authenticate_user(db, form_data.username, form_data.password)

# 2. If not found, try to find user by email
if not user:
    user_by_email = await get_user_by_email(db, form_data.username)
    if user_by_email and verify_password(form_data.password, user_by_email.hashed_password):
        user = user_by_email

# 3. If still not found, return 401
if not user:
    raise HTTPException(status_code=401, detail="Incorrect username/email or password")

# 4. Generate tokens and return
access_token = create_access_token({"sub": user.username})
refresh_token = create_refresh_token({"sub": user.username})
```

**Token Types:**
- `access_token`: Short-lived token (30 min) for accessing protected routes
- `refresh_token`: Long-lived token (7 days) for obtaining new access tokens

### 3.2 Authentication Step

**File:** `app/core/security.py` - `authenticate_user()`

**Step 1: Find user by username**

```python
user = await get_user_by_username(db, username)
```

**Step 2: Verify password (Timing-attack safe)**

```python
if not user:
    verify_password(password, DUMMY_HASH)  # Waste time even if user doesn't exist
    return None
```

**Step 3: Check password hash**

```python
if not verify_password(password, user.hashed_password):
    return None
return user  # Successfully authenticated!
```

**Complete Function:**

```python
async def authenticate_user(db: AsyncSession, username: str, password: str) -> Optional[User]:
    user = await get_user_by_username(db, username)
    if not user:
        verify_password(password, DUMMY_HASH)  # Timing attack prevention
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
```

**Why `DUMMY_HASH`?** Prevents timing attacks - takes same time whether user exists or not.

### 3.3 JWT Token Generation

**File:** `app/core/security.py` - `create_access_token()`

**Code:**

```python
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    settings = init_settings()
    to_encode = data.copy()
    
    # Calculate expiration (default: 30 minutes)
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    # Add expiration to payload
    to_encode.update({"exp": expire})
    
    # Encode and sign token
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
```

**Token Structure (JWT):**

A JWT consists of 3 parts separated by dots: `Header.Payload.Signature`

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "john_doe",          // subject (username)
  "exp": 1711689600,          // expiration timestamp
  "iat": 1711688000           // issued at timestamp
}

Signature: HMAC-SHA256(Header.Payload, SECRET_KEY)
```

**Example Token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huX2RvZSIsImV4cCI6MTcxMTY4OTYwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Access Token Lifecycle:**
1. Generated at login
2. Sent to client along with refresh token
3. Client stores (usually in localStorage or cookies)
4. Client sends with each protected request in Authorization header
5. Token expires after 30 minutes (default)
6. When expired, client uses refresh token to get new access token

**Refresh Token Lifecycle:**
1. Generated at login
2. Sent to client along with access token
3. Client stores securely (preferably in HttpOnly cookie)
4. Client sends to `/auth/refresh` endpoint when access token expires
5. Server verifies refresh token and issues new access token
6. Token expires after 7 days
7. User must login again when refresh token expires

### 3.4 Token Refresh Endpoint

**Endpoint:** `POST /api/v1/auth/refresh`

**Purpose:** Get a new access token using refresh token (when access token expires)

**Request:**
```bash
Content-Type: application/x-www-form-urlencoded
refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huX2RvZSIsImV4cCI6MTcxMTY5MDAwMH0...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huX2RvZSIsInR5cGUiOiJyZWZyZXNoIiwgImV4cCI6MTcxMjI5NDAwMH0...",
  "token_type": "bearer"
}
```

**Token Verification:**

**File:** `app/core/security.py` - `verify_refresh_token()`

```python
def verify_refresh_token(token: str) -> str:
    """Verify refresh token and return username."""
    settings = init_settings()
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        token_type = payload.get("type")
        if username is None or token_type != "refresh":
            raise credentials_exception
        return username
    except InvalidTokenError:
        raise credentials_exception  # Token expired or invalid
```

**Key Differences from Access Token:**
- `type` field set to `"refresh"` (prevents using access token to get new token)
- Longer expiration (7 days vs 30 minutes)
- Used only on `/refresh` endpoint, not for accessing protected routes

### 3.5 Accessing Protected Routes

**Example Route:** `GET /api/v1/auth/me`

**File:** `app/api/v1/endpoints/auth.py`

```python
@router.get("/me", response_model=UserRead)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user information."""
    return current_user
```

**Request with Token:**
```
GET /api/v1/auth/me HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.6 Token Verification Flow

**File:** `app/core/dependencies.py` - `get_current_user()`

**Step 1: Extract token from Authorization header**

```python
# OAuth2PasswordBearer handles this automatically
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),  # Extracts from "Bearer <token>"
) -> User:
    ...
```

**Step 2: Verify token signature and expiration**

```python
try:
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    username = payload.get("sub")
    if username is None:
        raise credentials_exception
except InvalidTokenError:
    raise credentials_exception  # Token expired or invalid signature
```

**Step 3: Find user in database**

```python
user = await get_user_by_username(db, username)
if user is None:
    raise credentials_exception  # User doesn't exist
return user
```

**Step 4: Check if user is active**

```python
async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
```

**Complete Flow Chart:**

```
1. Client sends request with Authorization header
   Authorization: Bearer <token>
   ↓
2. OAuth2PasswordBearer extracts the token string
   ↓
3. JWT decode with SECRET_KEY and ALGORITHM
   ├─ Invalid signature → 401 Unauthorized
   ├─ Token expired → 401 Unauthorized
   └─ Valid → Extract username from payload
   ↓
4. Query database for user by username
   ├─ User not found → 401 Unauthorized
   └─ User found → Get User object
   ↓
5. Check is_active status
   ├─ Not active → 400 Bad Request
   └─ Active → Continue
   ↓
6. Return User object to route
   ↓
7. Route has access to current_user: current_user.id, current_user.username, etc.
```

### 3.7 Dependency Injection Magic

**How FastAPI handles `Depends()`:**

```python
@router.get("/me", response_model=UserRead)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    return current_user
```

When FastAPI processes this route:

1. Sees `Depends(get_current_active_user)`
2. Calls `get_current_active_user()` automatically
3. Which depends on `get_current_user()`
4. Which depends on `get_db()` and `oauth2_scheme`
5. Builds dependency chain and executes all
6. Passes result as `current_user` parameter

---

## Architecture Overview

### Layered Architecture Pattern

```
┌─────────────────────────────────────────┐
│         API Layer (Endpoints)            │
│      @router.post, @router.get, etc.    │
├─────────────────────────────────────────┤
│      Service Layer (Business Logic)      │
│   UserService, validate, authorization  │
├─────────────────────────────────────────┤
│   Repository Layer (Data Access)         │
│   CRUD operations, database queries      │
├─────────────────────────────────────────┤
│    Model Layer (ORM)                     │
│    SQLAlchemy User model                │
├─────────────────────────────────────────┤
│         Database                         │
│      PostgreSQL users table              │
└─────────────────────────────────────────┘
```

### Request Flow

```
HTTP Request
    ↓
FastAPI Route Handler
    ↓ Dependency Injection
Database Session (get_db)
Current User (get_current_active_user)
    ↓ Input Validation
Pydantic Schema (UserCreate, etc.)
    ↓ Service Layer
UserService.register_user()
    ↓ Repository Layer
create_user(), get_user_by_username(), etc.
    ↓ SQLAlchemy
SQL Query Execution
    ↓ Database
PostgreSQL INSERT/SELECT/UPDATE operations
    ↓
Response Object Creation
    ↓ Output Serialization
Pydantic Schema (UserRead, etc.)
    ↓
JSON Response
    ↓
HTTP Response to Client
```

### File Structure

```
app/
├── main.py                  # FastAPI app setup, lifespan, CORS
├── api/
│   ├── deps.py             # Dependency functions
│   └── v1/
│       ├── api.py          # Router registration
│       └── endpoints/
│           ├── auth.py     # Authentication routes
│           └── users.py    # User management routes
├── core/
│   ├── config.py           # Settings from .env
│   ├── security.py         # JWT, password hashing, oauth2 scheme
│   └── dependencies.py     # Dependency injection (get_current_user, get_current_active_user)
├── db/
│   ├── base.py             # SQLAlchemy declarative base
│   └── session.py          # Database engine & sessions
├── models/
│   └── user.py             # User models (User, Student, Instructor)
│                            # Implements joined table inheritance pattern
├── repositories/
│   └── user.py             # CRUD operations (for all user types)
│                            # + role-specific queries (get_student_*, get_instructor_*)
├── schemas/
│   └── user.py             # Pydantic models
└── services/
    └── user.py             # Business logic
```

**User Model Architecture:**
```
User (Base Class) ← Common fields: id, username, email, password, role, is_active, created_at, updated_at
  ├── Student (Inherits User) ← student_id, enrollment_date, phone_number, date_of_birth, department
  ├── Instructor (Inherits User) ← qualification, specialization, bio, phone_number, department
  └── Admin (Uses base User table) ← No separate table needed
```

---

## Security Features

### 1. Password Security

✅ **Hashing Algorithm:** Argon2 or bcrypt (via pwdlib)
- Never stored as plain text
- Impossible to reverse
- Each hash has a random salt

```python
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()
hashed = password_hash.hash("SecurePassword123")
is_valid = password_hash.verify("SecurePassword123", hashed)
```

### 2. JWT Token Security

✅ **Signed Tokens:** Cannot be forged without SECRET_KEY
✅ **Access Token Expiration:** 30 minutes (short-lived for security)
✅ **Refresh Token Expiration:** 7 days (longer-lived for convenience)
✅ **Token Type Field:** Refresh tokens marked with `type: "refresh"` to prevent misuse
✅ **Algorithm:** HS256 (HMAC with SHA-256)

```python
jwt.encode({"sub": "john_doe", "exp": 1711689600}, SECRET_KEY, algorithm="HS256")
```

### 3. Timing Attack Prevention

✅ **Constant-Time Password Comparison**

Even if user doesn't exist, verification takes same time:

```python
if not user:
    verify_password(password, DUMMY_HASH)  # Waste time
    return None
# Prevents attackers from knowing which usernames exist
```

### 4. Unique Constraints

✅ **Database Level:**
```sql
username VARCHAR(50) UNIQUE NOT NULL
email VARCHAR(100) UNIQUE NOT NULL
```

✅ **Application Level:** Service validates before database insert

### 5. Active User Check

✅ **Disabled accounts cannot access protected routes**

```python
if not current_user.is_active:
    raise HTTPException(status_code=400, detail="Inactive user")
```

### 6. Environment Variables

✅ **No hardcoded secrets in code**

```python
SECRET_KEY = settings.SECRET_KEY  # From .env file
DATABASE_URL = settings.DATABASE_URL  # From .env file
```

### 7. CORS Middleware

✅ **Configurable cross-origin access** (should restrict in production)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 8. Async Implementation

✅ **Non-blocking database operations**

```python
async def get_user_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(User).where(User.username == username))
    # Doesn't block event loop while waiting for database
```

---

## API Examples

### Register a New User

**Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "name": "John Doe",
    "password": "SecurePassword123",
    "role": "STUDENT"
  }'
```

**Response (201 Created):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "STUDENT",
  "is_active": true
}
```

### Login

**Request with username:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=john_doe&password=SecurePassword123"
```

**Request with email:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=john@example.com&password=SecurePassword123"
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Note:** Both username and email work with the same endpoint for flexibility

### Refresh Access Token

**Request (when access token expires):**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/refresh" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Note:** Both access and refresh tokens are renewed for better security

### Access Protected Route

**Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "STUDENT",
  "is_active": true
}
```

### Invalid Token

**Request (expired or tampered token):**
```bash
curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer invalid.token.here"
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Could not validate credentials"
}
```

---

## Key Concepts

### 1. Async/Await

All database operations are async (non-blocking):
```python
async def get_user_by_username(db: AsyncSession, username: str):
    result = await db.execute(...)  # Non-blocking wait
    return result.scalars().first()
```

### 2. Dependency Injection

FastAPI automatically resolves dependencies:
```python
@router.get("/me")
async def route(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_active_user)
):
    # FastAPI calls get_db() and get_current_active_user() automatically
    pass
```

### 3. Pydantic Validation

Automatic input/output validation:
```python
class UserCreate(BaseModel):
    username: str
    email: EmailStr  # Validates email format
    password: str

# Input: Validates request body matches schema
# Output: Serializes User model to UserCreate schema
```

### 4. SQLAlchemy ORM

Object-relational mapping for database operations:
```python
user = User(username="john", email="john@example.com", ...)
db.add(user)
await db.commit()
# ORM generates SQL automatically
```

### 5. Polymorphic User Models (Joined Table Inheritance)

**✅ STATUS: FULLY IMPLEMENTED & TESTED**

Role-based user types efficiently using database inheritance:

```python
# Create users of different types
admin = User(username="admin", role=UserRole.ADMIN, type="user")
student = Student(username="john", student_id="STU-123", role=UserRole.STUDENT)
instructor = Instructor(username="jane", qualification="PhD", role=UserRole.INSTRUCTOR)

# Query by type
all_students = db.query(Student).all()  # Only students table
all_instructors = db.query(Instructor).all()  # Only instructors table
all_admins = db.query(User).filter(User.role == UserRole.ADMIN).all()  # Base table

# Polymorphic queries
user = db.query(User).filter(User.username == "john").first()
if isinstance(user, Student):
    print(user.student_id)  # Type-safe access
elif isinstance(user, Instructor):
    print(user.qualification)  # Type-safe access
```

**Implementation Details:**
- Migration `c970ce9dec62` successfully applied to PostgreSQL
- Database schema includes `users.type` discriminator column
- `students` table with student-specific fields (student_id, enrollment_date, etc.)
- `instructors` table with instructor-specific fields (qualification, specialization, etc.)
- Polymorphic queries tested and working correctly
- Type-safe inheritance prevents accessing non-existent fields

**Benefits:**
- ✅ No NULL columns for unused role fields
- ✅ Type-safe (IDE autocomplete works correctly)
- ✅ Optimized queries (only queries relevant table)
- ✅ Scalable to millions of users
- ✅ Professional LMS standard

### 6. JWT Tokens (Access & Refresh)

Stateless authentication (no session storage):
```python
# Access Token:
# - Short-lived (30 min), contains user info and expiration
# - Used for accessing protected routes
# - Server only verifies signature, no database lookup needed

# Refresh Token:
# - Long-lived (7 days), contains user info, type markerand expiration  
# - Used only for obtaining new access tokens
# - Reduces need for users to login frequently
# - Server verifies token type to prevent misuse
```

**Token Refresh Flow:**
```
Client has access_token (about to expire)
   ↓
Client sends refresh_token to /auth/refresh
   ↓
Server verifies refresh_token (signature, expiration, type)
   ↓
Server issues new access_token + new refresh_token
   ↓
Client updates stored tokens
   ↓
Client can continue accessing protected routes
```

---

## Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
# Database Configuration
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/lms

# JWT Configuration
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
# Note: Refresh token expiration is hardcoded to 7 days

# Application
DEBUG=True
APP_TITLE=LMS Backend
```

---

## Troubleshooting

### Import Error: `DATABASE_URL field required`
**Cause:** `.env` file missing or not loaded
**Solution:** Create `.env` from `.env.example` with valid values

### 401 Unauthorized on protected routes
**Cause:** Invalid or expired access token
**Solutions:**
- Check token format (should be `Bearer <token>`)
- If access token expired: use refresh token on `/auth/refresh` to get new one
- If refresh token expired too: login again with `/auth/token`
- Check token expiration (access: 30 minutes, refresh: 7 days)

### 400 Bad Request on registration
**Cause:** Validation failed (email format, duplicate username, etc.)
**Solution:** Check response detail message and fix input data

### Connection refused to database
**Cause:** PostgreSQL not running or wrong connection string
**Solution:** 
- Start PostgreSQL: `pg_isready`
- Check DATABASE_URL in `.env`
- Verify database exists: `createdb lms`

---

## Token Management Best Practices

### Client-Side Implementation

1. **Store tokens securely:**
   - Access token: localStorage or sessionStorage (accessible by JS)
   - Refresh token: HttpOnly cookie (NOT accessible by JS, sent automatically)

2. **Send access token with requests:**
   ```javascript
   const response = await fetch('/api/v1/auth/me', {
     headers: {
       'Authorization': `Bearer ${accessToken}`
     }
   });
   ```

3. **Handle token expiration:**
   ```javascript
   if (response.status === 401) {
     // Access token expired, use refresh token
     const newTokens = await fetch('/api/v1/auth/refresh', {
       method: 'POST',
       body: new URLSearchParams({ refresh_token: refreshToken })
     });
     // Update stored tokens and retry original request
   }
   ```

4. **Refresh token before expiration (optional optimization):**
   - Decode access token to get expiration
   - Refresh when ~5 minutes remaining
   - Provides seamless user experience

### Server-Side Security

- ✅ Access tokens are short-lived (hard to abuse if stolen)
- ✅ Refresh tokens are long-lived but less frequently transmitted
- ✅ Token type field prevents using one for the other's purpose
- ✅ Both tokens are signed (can't be forged)

---

## Next Steps

1. **Run migrations:** `alembic upgrade head`
2. **Start server:** `fastapi dev`
3. **Access API docs:** `http://localhost:8000/docs`
4. **Try endpoints:** Use Swagger UI or curl commands above
5. **Implement client-side token refresh logic** (see Token Management section)
6. **Extend:** Add more models, servicesand endpoints following this pattern

---

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [JWT Documentation](https://tools.ietf.org/html/rfc7519)
- [OAuth2 Documentation](https://tools.ietf.org/html/rfc6749)
