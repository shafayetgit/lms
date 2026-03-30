# Project Settings Module

## Overview

The **Project Settings Module** allows administrators to configure all project features, security policies, and provider settings through a centralized `project_settings.yaml` file—without modifying code or environment variables.

## Location & Files

- **Configuration File**: `project_settings.yaml` (in project root)
- **Python Module**: `app/core/project_settings.py`

## Quick Start

### 1. View Current Settings

```bash
# Settings are loaded automatically at application startup
# Check the logs for confirmation:
# ✅ Project settings loaded from: /path/to/project_settings.yaml
```

### 2. Edit Settings

Edit `project_settings.yaml` to configure:

```yaml
project:
  name: "LMS Backend"
  version: "1.0.0"

features:
  two_factor_auth:
    enabled: true
  oauth:
    enabled: true
    providers:
      google: true
      github: true
```

### 3. Use in Code

```python
from app.core.project_settings import get_project_settings

# Get settings
settings = get_project_settings()

# Access features
is_2fa_enabled = settings.features.two_factor_auth.enabled
is_oauth_enabled = settings.features.oauth.enabled

# Access security policies
max_login_attempts = settings.security.login.max_attempts
password_min_length = settings.security.password.min_length

# Access API config
cors_origins = settings.api.cors.allow_origins
pagination_limit = settings.api.pagination.default_limit

# Access provider info
email_provider = settings.providers.email.get("type")
sms_provider = settings.providers.sms.get("type")
```

## Configuration Sections

### 1. Project Metadata
```yaml
project:
  name: "LMS Backend"
  version: "1.0.0"
  description: "Learning Management System"
  organization: "MyOrganization"
```

### 2. Feature Flags

Enable or disable features without code changes:

```yaml
features:
  authentication:
    enabled: true
    email_verification: true
    forgot_password: true

  two_factor_auth:
    enabled: true
    allow_email_otp: true
    allow_sms_otp: true
    allow_totp: true

  oauth:
    enabled: true
    providers:
      google: true
      github: true

  email:
    enabled: true
    send_welcome_email: true

  sms:
    enabled: true

  rate_limiting:
    enabled: true
```

### 3. Provider Configuration

```yaml
providers:
  email: "smtp"          # 'smtp' | 'sendgrid'
  sms: "twilio"          # 'twilio' | 'vonage'
  database: "postgresql" # 'postgresql' | 'mysql'
  cache: "redis"         # 'redis' | 'memcached'
```

### 4. Security Policies

```yaml
security:
  password:
    min_length: 8
    require_uppercase: true
    require_lowercase: true
    require_digits: true
    require_special_chars: true

  login:
    max_attempts: 5
    lockout_minutes: 15
    track_failed_attempts: true

  session:
    access_token_expire_minutes: 30
    refresh_token_expire_days: 7
    absolute_timeout_days: 30

  account:
    auto_logout_inactive_minutes: 60
    enforce_unique_email: true
```

### 5. Rate Limiting

```yaml
rate_limiting:
  global:
    requests_per_minute: 60

  endpoints:
    auth_register:
      requests_per_minute: 5
    auth_login:
      requests_per_minute: 10

  otp:
    max_resend_attempts: 5
    resend_cooldown_seconds: 60
    expiration_minutes: 10
```

### 6. API Configuration

```yaml
api:
  title: "LMS Backend API"
  version: "v1"
  prefix: "/api"

  cors:
    allow_origins:
      - "http://localhost:3000"
      - "https://app.example.com"
    allow_credentials: true
    allow_methods: ["GET", "POST", "PUT", "DELETE"]
    allow_headers: ["Content-Type", "Authorization"]

  pagination:
    default_limit: 20
    max_limit: 100
```

### 7. OTP Settings

```yaml
otp:
  expiration_minutes: 10
  length: 6
  max_resend_attempts: 5
  resend_cooldown_seconds: 60
  storage: "redis"
```

### 8. Email Templates

```yaml
email_templates:
  enabled: true
  from_name: "LMS Notifications"
  from_address: "noreply@lms.example.com"

  templates:
    email_verification: "email_verification.html"
    password_reset: "password_reset.html"
    welcome: "welcome.html"
```

### 9. Logging

```yaml
logging:
  level: "INFO"  # DEBUG | INFO | WARNING | ERROR | CRITICAL
  log_auth_events: true
  log_failed_logins: true
  log_password_changes: true
  log_2fa_events: true
```

### 10. User Roles

```yaml
roles:
  enabled: true
  default_role: "student"
  available_roles:
    - "admin"
    - "instructor"
    - "student"
```

## Common Use Cases

### Disable 2FA Globally

```yaml
features:
  two_factor_auth:
    enabled: false
```

### Switch Email Provider to SendGrid

```yaml
providers:
  email:
    type: "sendgrid"
```

### Relax Password Requirements for Testing

```yaml
security:
  password:
    min_length: 4
    require_uppercase: false
    require_special_chars: false
```

### Add Production CORS Origins

```yaml
api:
  cors:
    allow_origins:
      - "https://app.mycompany.com"
      - "https://admin.mycompany.com"
```

### Increase Rate Limits for Enterprise

```yaml
rate_limiting:
  global:
    requests_per_minute: 200

  endpoints:
    auth_login:
      requests_per_minute: 50
```

## Validation

The `project_settings.py` module uses **Pydantic** for validation:

- ✅ YAML syntax is validated
- ✅ Data types are checked
- ✅ Missing values use sensible defaults
- ✅ Errors are reported with clear messages

Example of invalid config:

```yaml
security:
  login:
    max_attempts: "five"  # ❌ Should be integer
```

**Result**: Clear error message during startup

## Reloading Settings

Settings are loaded once at application startup. To reload:

```python
from app.core.project_settings import ProjectSettingsManager

manager = ProjectSettingsManager()
manager.reload()
```

## Best Practices

1. **Version Control**: Commit `project_settings.yaml` to git for consistency across environments
2. **Environment-Specific**: Create environment-specific versions:
   - `project_settings.yaml` - Base config
   - `project_settings.production.yaml` - Production overrides
3. **Backup**: Keep backups of working configurations
4. **Documentation**: Add comments in YAML for custom settings
5. **Testing**: Test configuration changes in staging before production

## Example: Multi-Environment Setup

**Development** (`project_settings.yaml`):
```yaml
features:
  two_factor_auth:
    enabled: false
  rate_limiting:
    enabled: false
security:
  password:
    min_length: 4
```

**Production** (override specific values):
```yaml
features:
  two_factor_auth:
    enabled: true
  rate_limiting:
    enabled: true
security:
  password:
    min_length: 12
```

## Troubleshooting

### Settings Not Loading

Check logs during startup:
```
✅ Project settings loaded from: /path/to/project_settings.yaml
❌ project_settings.yaml not found
```

**Solution**: Ensure `project_settings.yaml` exists in project root.

### YAML Syntax Error

```
Invalid YAML format in project_settings.yaml: ...
```

**Solution**: Check YAML indentation (use 2 spaces, not tabs).

### Type Validation Error

```
Error loading project settings: value is not a valid integer
```

**Solution**: Check that values match expected types (number, boolean, string, list).

## API Reference

### `get_project_settings()` → ProjectSettings

Get the global project settings instance.

```python
from app.core.project_settings import get_project_settings

settings = get_project_settings()
```

### `ProjectSettingsManager`

Manage settings loading and reloading.

```python
from app.core.project_settings import ProjectSettingsManager

manager = ProjectSettingsManager()
settings = manager.get_settings()
manager.reload()  # Reload from file
```

## Summary

The **Project Settings Module** provides:

✅ **Centralized Configuration** - All settings in one YAML file  
✅ **No Code Changes Needed** - Edit settings without touching code  
✅ **Type-Safe** - Pydantic validation ensures correct config  
✅ **Flexible** - Support for multiple environments  
✅ **Easy to Use** - Simple Python API for accessing settings  

Perfect for administrators who need to configure the system without coding knowledge!
