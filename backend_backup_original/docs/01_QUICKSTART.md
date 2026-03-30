# Quick Start Guide - Professional Auth System

> ℹ️ **For detailed configuration guides**, see [02_SETUP.md](./02_SETUP.md) for step-by-step email, SMS, OAuth, and database setup with all available options.

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies (1 min)
```bash
cd /home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend
pip install -e .
```

### Step 2: Setup Environment Variables (2 min)
```bash
# Copy example template
cp .env.example .env

# Edit with your values (minimal for testing)
# Required:
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/lms_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-change-this

# Email (choose SMTP for easy testing)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAILS_FROM_EMAIL=noreply@lms.example.com
```

### Step 3: Apply Database Migration (30 sec)
```bash
cd /home/shafayet/Workspace/projects/paid_projects/mayeen/lms/backend
python3 -m alembic upgrade head
```

### Step 4: Start the Server (1 min)
```bash
fastapi dev
# or
uvicorn app.main:app --reload
```

### Step 5: Test the API (1 min)
Visit: http://localhost:8000/docs

---

## 🧪 Quick Test Flow

### 1. Register a User
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "password": "TestPass123!"
  }'
```

Expected Response: 201 Created with user details

### 2. Verify Email
Check your email for OTP, then:
```bash
curl -X POST http://localhost:8000/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=TestPass123!"
```

Expected Response:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### 4. Access Protected Endpoint
```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔧 Configuration by Use Case

### Development (Quickest Setup)
```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/lms_dev
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=dev-secret-key-change-in-production
DEBUG=True
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-mailtrap-user
SMTP_PASSWORD=your-mailtrap-password
TWO_FA_ENABLED=false
```

### Staging (Reliable Setup)
```env
DATABASE_URL=postgresql+asyncpg://user:pass@staging.db:5432/lms
REDIS_URL=redis://staging.redis:6379/0
SECRET_KEY=strong-random-key-here
DEBUG=False
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your-api-key
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
TWO_FA_ENABLED=true
GOOGLE_OAUTH_CLIENT_ID=...
GITHUB_OAUTH_CLIENT_ID=...
```

### Production (Secure Setup)
```env
DATABASE_URL=postgresql+asyncpg://user:pass@prod.db:5432/lms
REDIS_URL=redis://:password@prod.redis:6379/0
SECRET_KEY=generate-strong-random-key-with-secrets-module
DEBUG=False
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your-api-key
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
TWO_FA_ENABLED=true
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GITHUB_OAUTH_CLIENT_ID=...
GITHUB_OAUTH_CLIENT_SECRET=...
MAX_LOGIN_ATTEMPTS=3
LOGIN_ATTEMPT_LOCKOUT_MINUTES=30
PASSWORD_MIN_LENGTH=10
```

---

## 📧 Email Provider Setup

### Option 1: Gmail (Free, Easy)
1. Enable 2FA on your Gmail account
2. Generate App Password:
   - Go to myaccount.google.com/apppasswords
   - Select Mail and Windows Computer (or custom)
   - Copy the 16-character password
3. In .env:
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=the-16-char-app-password
```

### Option 2: SendGrid (Production Recommended)
1. Create free SendGrid account: https://sendgrid.com
2. Create API Key in Settings
3. In .env:
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your-api-key-here
```

### Option 3: Mailtrap (Testing)
1. Create account: https://mailtrap.io
2. Copy SMTP credentials
3. In .env:
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=465 or 587
SMTP_USER=your-user
SMTP_PASSWORD=your-password
```

---

## 💬 SMS Setup (Optional)

### Twilio (Recommended)
1. Create account: https://twilio.com
2. Get Account SID and Auth Token from Dashboard
3. Get a Twilio phone number
4. In .env:
```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 🔐 OAuth Setup (Optional)

### Google OAuth
1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `http://localhost:8000/api/v1/auth/oauth/google/callback`
6. Copy Client ID and Secret to .env:
```env
GOOGLE_OAUTH_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=xxx
GOOGLE_OAUTH_REDIRECT_URL=http://localhost:8000/api/v1/auth/oauth/google/callback
```

### GitHub OAuth
1. Go to https://github.com/settings/developers
2. New OAuth App
3. Fill in details:
   - Application name: LMS
   - Homepage URL: http://localhost:8000
   - Authorization callback URL: `http://localhost:8000/api/v1/auth/oauth/github/callback`
4. Copy Client ID and Secret to .env:
```env
GITHUB_OAUTH_CLIENT_ID=xxx
GITHUB_OAUTH_CLIENT_SECRET=xxx
GITHUB_OAUTH_REDIRECT_URL=http://localhost:8000/api/v1/auth/oauth/github/callback
```

---

## 🐛 Troubleshooting

### Issue: "SMTP authentication failed"
**Solution**: Check SMTP credentials and enable "Less secure apps" for Gmail

### Issue: "OTP not sending"
**Solution**: Check EMAIL_PROVIDER and email credentials in .env

### Issue: "Redis connection refused"
**Solution**: Make sure Redis is running: `redis-cli ping` should return PONG

### Issue: "Database migration fails"
**Solution**: Check DATABASE_URL and ensure database exists

### Issue: "Unauthorized" on protected endpoints
**Solution**: Make sure you're sending the access token in Authorization header: `Bearer {token}`

---

## 📚 Full Documentation

For complete setup and API documentation:
- **[SETUP.md](./SETUP.md)** - Comprehensive configuration guide (database, email, SMS, OAuth, running server)
- **[README.md](./README.md)** - Project overview, tech stack, features
- **[AUTH_SYSTEM.md](./AUTH_SYSTEM.md)** - Complete API reference
- **[IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)** - Implementation details
- **[CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md)** - All changes made

## 🧩 API Summary

```
Registration:
  POST /api/v1/auth/register          - Register new user
  POST /api/v1/auth/verify-email      - Verify email with OTP
  POST /api/v1/auth/resend-otp        - Resend OTP

Login:
  POST /api/v1/auth/token             - Login
  POST /api/v1/auth/refresh           - Refresh token
  GET  /api/v1/auth/me                - Get current user

Password:
  POST /api/v1/auth/forgot-password   - Request reset
  POST /api/v1/auth/reset-password    - Reset with OTP
  POST /api/v1/auth/change-password   - Change password
  GET  /api/v1/auth/password-policy   - Get policy

2FA:
  POST /api/v1/auth/2fa/enable        - Enable 2FA
  POST /api/v1/auth/2fa/verify        - Verify 2FA code
  POST /api/v1/auth/2fa/disable       - Disable 2FA

OAuth:
  GET  /api/v1/auth/oauth/google/authorize
  POST /api/v1/auth/oauth/google/callback
  GET  /api/v1/auth/oauth/github/authorize
  POST /api/v1/auth/oauth/github/callback
```

---

## ✅ Verification Checklist

- [ ] Dependencies installed (`pip install -e .`)
- [ ] .env file created and configured
- [ ] Database running and accessible
- [ ] Redis running and accessible
- [ ] Database migrations applied (`alembic upgrade head`)
- [ ] Server starting without errors
- [ ] Can access http://localhost:8000/docs
- [ ] Can register a user
- [ ] Receive email with OTP
- [ ] Can verify email
- [ ] Can login

---

## 🎉 You're Ready!

Once all checks pass, your professional auth system is ready to use!

**What's next?**
- 🚀 **Quick Setup**: Follow the **Development** configuration above to get running locally
- 🔧 **Advanced Setup**: See [02_SETUP.md](./02_SETUP.md) for production email (SendGrid), SMS (Twilio), OAuth (Google/GitHub)
- 🏗️ **Integration**: Build your frontend to call these auth endpoints
- 📖 **API Details**: Check [03_ARCHITECTURE.md](./03_ARCHITECTURE.md) for system design and implementation

**For troubleshooting**: See the troubleshooting section above or check [02_SETUP.md](./02_SETUP.md) for detailed error solutions.
