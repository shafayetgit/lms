# Complete Setup Guide

Comprehensive setup instructions for the LMS Backend authentication system.

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Database Setup](#database-setup)  
3. [Email Configuration](#email-configuration)
4. [SMS Configuration](#sms-configuration)
5. [OAuth Configuration](#oauth-configuration)
6. [Running the Server](#running-the-server)
7. [Verification](#verification)

---

## Environment Setup

### Step 1: Install Python Dependencies

**Using uv (Recommended - faster):**
```bash
cd backend
uv sync
```

**Using pip:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Create Environment File

```bash
# Copy the template
cp .env.example .env

# Open in your editor
nano .env  # or vim, VS Code, etc.
```

### Step 3: Essential Configuration

Add these **required** variables to `.env`:

```env
# Database Connection
DATABASE_URL=postgresql+asyncpg://lms_user:secure_password@localhost:5432/lms

# Security (Generate a random 32+ character string)
# python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=your-random-32plus-character-secret-key-here

# Server
DEBUG=False
PORT=8000

# Redis (for OTP storage)
REDIS_URL=redis://localhost:6379/0
```

---

## Database Setup

### Using Docker (Recommended)

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify they're running
docker-compose ps

# Docker output should show:
# postgres - Up
# redis - Up
```

### Using Local Installation

**Linux/Mac:**
```bash
# Install PostgreSQL
brew install postgresql  # macOS
# or: sudo apt-get install postgresql  # Ubuntu
```

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Run installer, remember the password

**Then start PostgreSQL:**
```bash
# Linux
sudo systemctl start postgresql

# macOS  
brew services start postgresql

# Windows
# Should auto-start after installation
```

### Create LMS Database

```bash
# Using psql CLI
psql -U postgres

# Then in psql prompt:
CREATE USER lms_user WITH PASSWORD 'secure_password';
CREATE DATABASE lms OWNER lms_user;
GRANT ALL PRIVILEGES ON DATABASE lms TO lms_user;
\q
```

Or use one command:
```bash
psql -U postgres -c "CREATE USER lms_user WITH PASSWORD 'secure_password'; CREATE DATABASE lms OWNER lms_user;"
```

### Run Migrations

```bash
# Apply all migrations
alembic upgrade head

# Check current migration state
alembic current

# Should output: f2b3c4d5e6f7 (OAuth refactoring migration)
```

---

## Email Configuration

### Option 1: Gmail SMTP (Free)

1. Enable 2-Factor Authentication on Gmail account
2. Generate app-specific password: https://myaccount.google.com/apppasswords
3. Add to `.env`:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
EMAILS_FROM_EMAIL=noreply@yourapp.com
EMAILS_FROM_NAME=LMS System
```

### Option 2: SendGrid (Recommended for Production)

1. Create SendGrid account: https://sendgrid.com
2. Create API key
3. Add to `.env`:

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
EMAILS_FROM_EMAIL=noreply@yourapp.com
EMAILS_FROM_NAME=LMS System
```

### Test Email Setup

```bash
# Start server
fastapi dev

# In another terminal, register a user:
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "your-test-email@gmail.com",
    "password": "TestPass123!",
    "first_name": "Test",
    "last_name": "User"
  }'

# Check your email for verification code
# Look for "Email Verification" message
```

---

## SMS Configuration

### Setup Twilio

1. Create Twilio account: https://www.twilio.com/console
2. Get Account SID and Auth Token
3. Get or verify a phone number (Twilio provides trial credits)
4. Add to `.env`:

```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_PHONE_NUMBER=+1234567890
```

### Configure 2FA SMS

Users can enable SMS 2FA with:

```bash
# Enable SMS 2FA for user
curl -X POST http://localhost:8000/api/v1/auth/2fa/enable \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "sms",
    "phone_number": "+1234567890"
  }'
```

---

## OAuth Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "LMS App")
3. Enable Google+ API:
   - Search "Google+ API"
   - Click "Enable"
4. Create OAuth consent screen:
   - User Type: "External"
   - Fill app information
   - Add test users
5. Create credentials:
   - Type: Web application
   - Add authorized redirect URIs:
     - `http://localhost:8000/api/v1/auth/oauth/google/callback` (dev)
     - `https://yourdomain.com/api/v1/auth/oauth/google/callback` (production)
6. Copy Client ID and Secret to `.env`:

```env
GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### GitHub OAuth Setup

1. Go to [GitHub Settings > Developer settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: "LMS"
   - Homepage URL: `http://localhost:8000` (or your domain)
   - Authorization callback URL: `http://localhost:8000/api/v1/auth/oauth/github/callback`
4. Copy Client ID and Secret to `.env`:

```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Test OAuth Login

Access OAuth endpoints:
- Google: GET `/api/v1/auth/oauth/google/authorize?state=random_state`
- GitHub: GET `/api/v1/auth/oauth/github/authorize?state=random_state`

Or use Swagger UI at http://localhost:8000/docs

---

## Running the Server

### Development Mode (Auto-reload)

```bash
fastapi dev

# Server starts at: http://127.0.0.1:8000
# Auto-reloads on code changes
# Shows detailed error messages
```

### Production Mode

```bash
fastapi run

# Or with gunicorn
gunicorn app.main:app -w 4 --worker-class uvicorn.workers.UvicornWorker
```

### Using Docker

```bash
# Build image
docker build -t lms-backend .

# Run container
docker run -p 8000:8000 \
  --env-file .env \
  --link postgres:postgres \
  --link redis:redis \
  lms-backend
```

---

## Verification

### Health Check

```bash
curl http://localhost:8000/health

# Response:
➜ {"status": "ok"}
```

### API Documentation

Open in browser:
- **Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc

Click "Try it out" on any endpoint to test

### Test Complete Auth Flow

**1. Register:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

**2. Verify Email:** (Check your email for OTP code)
```bash
curl -X POST http://localhost:8000/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

**3. Login:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePass123!"
  }'

# Response includes: access_token, refresh_token
```

**4. Get Current User:**
```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**5. Enable 2FA:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/2fa/enable \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "email"  # or "sms" or "totp"
  }'
```

---

## Troubleshooting

### PostgreSQL Connection Error
```
Error: could not connect to server
```
**Solution:**
```bash
# Check if postgres is running
docker-compose ps  # Should show postgres up
# or
psql postgres  # Should connect

# Check DATABASE_URL format:
postgresql+asyncpg://user:password@localhost:5432/dbname
```

### Redis Connection Error
```
Error: Connection refused (redis)
```
**Solution:**
```bash
# Start Redis
docker-compose up redis -d

# Or for local Redis:
redis-cli ping  # Should respond PONG
```

### Email Not Sending
```
SMTP Authentication failed
```
**Solutions:**
- Gmail: Generate app-specific password (not regular password)
- SendGrid: Verify API key format (starts with `SG.`)
- Check `.env` has correct credentials
- Look at logs: `docker-compose logs backend |grep aiosmtplib`

### Migration Failed
```
alembic upgrade head fails
```
**Solution:**
```bash
# See which migration failed
alembic history

# Downgrade to last working state
alembic downgrade -1

# Try upgrade again
alembic upgrade head
```

### Cannot Access /docs
```
Got 404 at /docs
```
**Solution:**
- Check server is running: `fastapi dev`
- Wait 2-3 seconds for server to start
- Clear browser cache: Ctrl+F5

---

## Environment Variables Reference

```env
# ===== DATABASE =====
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/lms

# ===== SECURITY =====
SECRET_KEY=your-random-32plus-character-secret-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# ===== SERVER =====
DEBUG=False
PORT=8000
APP_TITLE=LMS Backend

# ===== EMAIL =====
EMAIL_PROVIDER=smtp  # or sendgrid
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=app-specific-password
SENDGRID_API_KEY=SG.xxxxx
EMAILS_FROM_EMAIL=noreply@app.com
EMAILS_FROM_NAME=LMS System

# ===== SMS =====
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890

# ===== OAUTH =====
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GITHUB_CLIENT_ID=xxxxx
GITHUB_CLIENT_SECRET=xxxxx

# ===== REDIS =====
REDIS_URL=redis://localhost:6379/0

# ===== OTP/2FA =====
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6
TOTP_ISSUER=LMS
```

---

## Next Steps

1. ✅ Environment setup
2. ✅ Database configuration  
3. ✅ Email configuration
4. ✅ Server running

Now:
- Read [AUTH_SYSTEM.md](AUTH_SYSTEM.md) for full auth flows
- Check [OAUTH_REFACTORING.md](OAUTH_REFACTORING.md) for OAuth design
- Explore [README.md](README.md) for project overview

---

**Need help?** Check server logs: `docker-compose logs backend`
