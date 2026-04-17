"""
Project Settings Module

Loads and validates project configuration from project_settings.yaml.
Administrators can modify settings through the YAML file without changing code.
"""

import yaml
from pathlib import Path
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
from functools import lru_cache


# ============================================================================
# PYDANTIC MODELS FOR VALIDATION
# ============================================================================

class ProjectMetadata(BaseModel):
    name: str = Field(default="LMS Backend")
    version: str = Field(default="1.0.0")
    description: str = Field(default="")
    organization: str = Field(default="")


class AuthenticationFeatures(BaseModel):
    enabled: bool = True
    email_verification: bool = True
    forgot_password: bool = True


class TwoFactorAuthFeatures(BaseModel):
    enabled: bool = True
    allow_email_otp: bool = True
    allow_sms_otp: bool = True
    allow_totp: bool = True





class EmailFeatures(BaseModel):
    enabled: bool = True
    send_welcome_email: bool = True
    send_verification_email: bool = True
    send_password_reset_email: bool = True


class SMSFeatures(BaseModel):
    enabled: bool = True
    send_verification_sms: bool = True
    send_2fa_sms: bool = True


class RateLimitingFeatures(BaseModel):
    enabled: bool = True


class Features(BaseModel):
    authentication: AuthenticationFeatures = Field(default_factory=AuthenticationFeatures)
    two_factor_auth: TwoFactorAuthFeatures = Field(default_factory=TwoFactorAuthFeatures)

    email: EmailFeatures = Field(default_factory=EmailFeatures)
    sms: SMSFeatures = Field(default_factory=SMSFeatures)
    rate_limiting: RateLimitingFeatures = Field(default_factory=RateLimitingFeatures)


class Providers(BaseModel):
    email: Dict[str, str] = Field(default={"type": "smtp"})
    sms: Dict[str, str] = Field(default={"type": "twilio"})
    database: Dict[str, str] = Field(default={"type": "postgresql"})
    cache: Dict[str, str] = Field(default={"type": "redis"})


class PasswordPolicy(BaseModel):
    min_length: int = 8
    require_uppercase: bool = True
    require_lowercase: bool = True
    require_digits: bool = True
    require_special_chars: bool = True


class LoginPolicy(BaseModel):
    max_attempts: int = 5
    lockout_minutes: int = 15
    track_failed_attempts: bool = True


class SessionPolicy(BaseModel):
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    absolute_timeout_days: int = 30


class AccountPolicy(BaseModel):
    auto_logout_inactive_minutes: int = 60
    enforce_unique_email: bool = True
    enforce_unique_username: bool = True


class Security(BaseModel):
    password: PasswordPolicy = Field(default_factory=PasswordPolicy)
    login: LoginPolicy = Field(default_factory=LoginPolicy)
    session: SessionPolicy = Field(default_factory=SessionPolicy)
    account: AccountPolicy = Field(default_factory=AccountPolicy)


class RateLimitEndpoints(BaseModel):
    auth_register: Dict[str, int] = Field(default={"requests_per_minute": 5})
    auth_login: Dict[str, int] = Field(default={"requests_per_minute": 10})
    auth_forgot_password: Dict[str, int] = Field(default={"requests_per_minute": 3})
    auth_verify_email: Dict[str, int] = Field(default={"requests_per_minute": 10})
    auth_resend_otp: Dict[str, int] = Field(default={"requests_per_minute": 3})


class RateLimitQuotas(BaseModel):
    max_resend_attempts: int = 5
    resend_cooldown_seconds: int = 60
    expiration_minutes: int = 10
    length: int = 6


class RateLimitingConfig(BaseModel):
    global_: Dict[str, int] = Field(default={"requests_per_minute": 60}, alias="global")
    endpoints: RateLimitEndpoints = Field(default_factory=RateLimitEndpoints)
    otp: RateLimitQuotas = Field(default_factory=RateLimitQuotas)


class CORSConfig(BaseModel):
    allow_origins: list[str] = Field(default=["http://localhost:3000"])
    allow_credentials: bool = True
    allow_methods: list[str] = Field(default=["GET", "POST", "PUT", "DELETE", "PATCH"])
    allow_headers: list[str] = Field(default=["Content-Type", "Authorization"])


class PaginationConfig(BaseModel):
    default_limit: int = 20
    max_limit: int = 100
    default_offset: int = 0


class APIConfig(BaseModel):
    title: str = "LMS Backend API"
    version: str = "v1"
    description: str = ""
    prefix: str = "/api"
    cors: CORSConfig = Field(default_factory=CORSConfig)
    pagination: PaginationConfig = Field(default_factory=PaginationConfig)


class OTPConfig(BaseModel):
    expiration_minutes: int = 10
    length: int = 6
    max_resend_attempts: int = 5
    resend_cooldown_seconds: int = 60
    storage: str = "redis"


class EmailTemplates(BaseModel):
    enabled: bool = True
    from_name: str = "LMS Notifications"
    from_address: str = "noreply@lms.example.com"
    templates: Dict[str, str] = Field(default={
        "email_verification": "email_verification.html",
        "password_reset": "password_reset.html",
        "welcome": "welcome.html",
        "account_locked": "account_locked.html",
        "two_factor_setup": "two_factor_setup.html",
    })


class Logging(BaseModel):
    level: str = "INFO"
    log_auth_events: bool = True
    log_failed_logins: bool = True
    log_password_changes: bool = True
    log_2fa_events: bool = True


class Roles(BaseModel):
    enabled: bool = True
    default_role: str = "student"
    available_roles: list[str] = Field(default=["admin", "instructor", "student"])


class DatabaseConfig(BaseModel):
    auto_migrate: bool = False
    pool_enabled: bool = True
    pool_size: int = 20
    log_queries: bool = False


class CacheConfig(BaseModel):
    default_ttl_seconds: int = 3600
    cache_otp: bool = True
    cache_sessions: bool = True
    cache_api_responses: bool = False


class ProjectSettings(BaseModel):
    """Main project settings model"""
    project: ProjectMetadata = Field(default_factory=ProjectMetadata)
    features: Features = Field(default_factory=Features)
    providers: Providers = Field(default_factory=Providers)
    security: Security = Field(default_factory=Security)
    rate_limiting: RateLimitingConfig = Field(default_factory=RateLimitingConfig)
    api: APIConfig = Field(default_factory=APIConfig)
    otp: OTPConfig = Field(default_factory=OTPConfig)
    email_templates: EmailTemplates = Field(default_factory=EmailTemplates)
    logging: Logging = Field(default_factory=Logging)
    roles: Roles = Field(default_factory=Roles)
    database: DatabaseConfig = Field(default_factory=DatabaseConfig)
    cache: CacheConfig = Field(default_factory=CacheConfig)

    class Config:
        populate_by_name = True


# ============================================================================
# SETTINGS LOADER & MANAGER
# ============================================================================

class ProjectSettingsManager:
    """Load, validate and manage project settings from YAML configuration"""

    _instance: Optional["ProjectSettingsManager"] = None
    _settings: Optional[ProjectSettings] = None

    def __new__(cls) -> "ProjectSettingsManager":
        """Singleton pattern - only one instance"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        """Initialize settings manager"""
        if self._settings is None:
            self._load_settings()

    def _get_settings_path(self) -> Path:
        """Get path to project_settings.yaml"""
        # Check in project root first
        root_path = Path(__file__).parent.parent.parent / "project_settings.yaml"
        if root_path.exists():
            return root_path

        # Fallback to app root
        app_path = Path(__file__).parent.parent / "project_settings.yaml"
        if app_path.exists():
            return app_path

        raise FileNotFoundError(
            "project_settings.yaml not found. "
            "Please create it in the project root directory."
        )

    def _load_settings(self) -> None:
        """Load and validate settings from YAML file"""
        try:
            settings_path = self._get_settings_path()
            with open(settings_path, "r") as f:
                config_dict = yaml.safe_load(f) or {}
            
            # Validate with Pydantic
            self._settings = ProjectSettings(**config_dict)
            print(f"✅ Project settings loaded from: {settings_path}")

        except FileNotFoundError as e:
            print(f"⚠️ {e}")
            print("Using default settings...")
            self._settings = ProjectSettings()

        except yaml.YAMLError as e:
            raise ValueError(f"Invalid YAML format in project_settings.yaml: {e}")

        except Exception as e:
            raise ValueError(f"Error loading project settings: {e}")

    def get_settings(self) -> ProjectSettings:
        """Get loaded settings"""
        if self._settings is None:
            self._load_settings()
        return self._settings

    def reload(self) -> None:
        """Reload settings from file"""
        self._settings = None
        self._load_settings()

    def get_dict(self) -> Dict[str, Any]:
        """Get settings as dictionary"""
        return self._settings.model_dump() if self._settings else {}


# ============================================================================
# SINGLETON ACCESS FUNCTION
# ============================================================================

@lru_cache()
def get_project_settings() -> ProjectSettings:
    """
    Get project settings (cached).
    
    Usage:
        from app.core.project_settings import get_project_settings
        
        settings = get_project_settings()
        is_2fa_enabled = settings.features.two_factor_auth.enabled
        max_login_attempts = settings.security.login.max_attempts
    """
    manager = ProjectSettingsManager()
    return manager.get_settings()
