"""
Complete Authentication Endpoints
Handles registration, sign in, 2FA, password management, etc.
"""

from datetime import timedelta, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.api.deps import get_db
from app.core.dependencies import get_current_active_user, get_current_user
from app.core.responses import success_response
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
    authenticate_user,
    verify_password,
    get_password_hash,
)
from app.core.config import init_settings
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, RegisterResponse
from app.schemas.auth import (
    SignInSchema,
    TokenResponse,
    VerifyEmailRequest,
    ResendOTPRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
    Enable2FARequest,
    Verify2FARequest,
    GenerateTOTPRequest,
    VerifyTOTPRequest,
    Disable2FARequest,
    PasswordPolicyResponse,
)
from app.repositories.user import (
    get_user_by_email,
    get_user_by_username,
    update_user,
)
from app.services.otp import get_otp_service
from app.services.email import get_email_service
from app.services.sms import get_sms_service
from app.services.user import register_user
from app.tasks.emails import send_verification_email, send_welcome_email

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Auth"])


# ============================================================================
# REGISTRATION & EMAIL VERIFICATION
# ============================================================================
@router.post(
    "/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED
)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    try:
        user = await register_user(db, user_in)

        otp = await get_otp_service().send_email_otp(user.email)
        settings = init_settings()

        if settings.CELERY_ENABLED:
            try:
                send_verification_email.delay(user.email, otp, user.first_name)
            except Exception as e:
                logger.warning(f"Celery enqueue failed; falling back: {e}")
                email_service = get_email_service()
                await email_service.send_verification_email(
                    to_email=user.email,
                    otp=otp,
                    user_name=user.first_name,
                )
        else:
            email_service = get_email_service()
            await email_service.send_verification_email(
                to_email=user.email,
                otp=otp,
                user_name=user.first_name,
            )

        return {
            "status": "success",
            "user": user,
            "message": "User registered successfully. Please verify your email.",
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed",
        )


@router.post("/verify-email", response_model=dict)
async def verify_email(
    request: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Verify email address with OTP code.

    After successful verification, user can sign in.
    """
    # Verify OTP
    otp_service = get_otp_service()
    if not await otp_service.verify_email_otp(request.email, request.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )

    # Update user email_verified status
    user = await get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.email_verified:
        return {"message": "Email already verified"}

    user.email_verified = True
    await update_user(db, user)

    # Send welcome email
    settings = init_settings()
    if settings.CELERY_ENABLED:
        try:
            send_welcome_email.delay(user.email, user.first_name)
        except Exception as e:
            logger.warning(
                f"Celery enqueue failed; falling back to direct email send: {e}"
            )
            email_service = get_email_service()
            await email_service.send_welcome_email(
                to_email=user.email,
                user_name=user.first_name,
            )
    else:
        email_service = get_email_service()
        await email_service.send_welcome_email(
            to_email=user.email,
            user_name=user.first_name,
        )

    return {"message": "Email verified successfully"}


@router.post("/resend-otp", response_model=dict)
async def resend_otp(
    request: ResendOTPRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Resend OTP to email or SMS.

    Rate limited to prevent abuse.
    """
    settings = init_settings()
    otp_service = get_otp_service()

    # Check if on cooldown
    if request.method == "email":
        if await otp_service.is_email_otp_on_cooldown(request.email):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {settings.OTP_RESEND_COOLDOWN_SECONDS} seconds before requesting another OTP",
            )

        attempts = await otp_service.get_otp_attempts(request.email)
        if attempts >= settings.OTP_RESEND_MAX_ATTEMPTS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Maximum OTP attempts ({settings.OTP_RESEND_MAX_ATTEMPTS}) exceeded",
            )

        otp = await otp_service.send_email_otp(request.email)

        if settings.CELERY_ENABLED:
            try:
                send_verification_email.delay(
                    to_email=request.email,
                    otp=otp,
                    user_name=request.email,
                )
            except Exception as e:
                logger.warning(f"Celery enqueue failed; falling back: {e}")
                email_service = get_email_service()
                email_service.send_verification_email(
                    to_email=request.email,
                    otp=otp,
                    user_name=request.email,
                )
        else:
            email_service = get_email_service()
            email_service.send_verification_email(
                to_email=request.email,
                otp=otp,
                user_name=request.email,
            )

    elif request.method == "sms":
        user = await get_user_by_email(db, request.email)
        if not user or not user.phone_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number not configured",
            )

        if await otp_service.is_sms_otp_on_cooldown(user.phone_number):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {settings.OTP_RESEND_COOLDOWN_SECONDS} seconds before requesting another OTP",
            )

        otp = await otp_service.send_sms_otp(user.phone_number)
        sms_service = get_sms_service()
        await sms_service.send_otp_sms(user.phone_number, otp)

    return {
        "message": f"OTP sent to {request.method}",
        "attempts_remaining": settings.OTP_RESEND_MAX_ATTEMPTS - attempts,
    }


# ============================================================================
# Sign In & TOKEN MANAGEMENT
# ============================================================================


@router.post("/token", response_model=TokenResponse)
async def sign_in(
    data: SignInSchema,
    db: AsyncSession = Depends(get_db),
):
    """
    Sign in with username/email and password.

    Returns access and refresh tokens for authenticated user.
    Requires email verification before sign in.
    """
    settings = init_settings()

    # Try authentication with username first
    user = await authenticate_user(db, data.username, data.password)

    # If not found, try with email
    if not user:
        user_by_email = await get_user_by_email(db, data.username)
        if user_by_email and verify_password(
            data.password, user_by_email.hashed_password
        ):
            user = user_by_email

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
        )

    # Check if email is verified
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your email before logging in.",
        )

    # Check if account is locked
    if user.is_locked and user.locked_until:
        if datetime.now(timezone.utc) < user.locked_until:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is locked due to too many failed sign in attempts. Try again later.",
            )
        else:
            # Unlock account
            user.is_locked = False
            user.locked_until = None
            user.sign_in_attempts = 0
            await update_user(db, user)

    # Reset sign in attempts on successful auth
    if user.sign_in_attempts > 0:
        user.sign_in_attempts = 0
        user.last_failed_sign_in = None

    user.last_sign_in = datetime.now(timezone.utc)
    await update_user(db, user)

    # Check if 2FA is enabled
    if user.two_factor_enabled:
        # Generate 2FA OTP and send it
        otp_service = get_otp_service()
        otp = await otp_service.send_email_otp(user.email)

        email_service = get_email_service()
        await email_service.send_2fa_otp_email(
            to_email=user.email,
            otp=otp,
            user_name=user.first_name,
        )

        return TokenResponse(
            access_token="",
            refresh_token="",
            token_type="2fa_required",
        )

    # Generate tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.username,
            "emailVerified": user.email_verified,
            "role": user.role,
        },
        expires_delta=access_token_expires,
    )
    refresh_token = create_refresh_token(data={"sub": user.username})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token_endpoint(refresh_token: str):
    """
    Get new access token using refresh token.

    Refresh tokens have longer expiry than access tokens.
    """
    settings = init_settings()
    username = verify_refresh_token(refresh_token)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": username},
        expires_delta=access_token_expires,
    )
    new_refresh_token = create_refresh_token(data={"sub": username})

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
    )


# ============================================================================
# PASSWORD MANAGEMENT
# ============================================================================


@router.post("/forgot-password", response_model=dict)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Request password reset.

    Sends reset OTP to registered email.
    """
    user = await get_user_by_email(db, request.email)

    # Don't reveal if user exists for security reasons
    if not user:
        return {"message": "If email exists, password reset code will be sent"}

    otp_service = get_otp_service()
    otp = await otp_service.send_email_otp(user.email)

    email_service = get_email_service()
    await email_service.send_password_reset_email(
        to_email=user.email,
        otp=otp,
        user_name=user.first_name,
    )

    return {"message": "Password reset code sent to email if account exists"}


@router.post("/reset-password", response_model=TokenResponse)
async def reset_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Reset password using OTP and new password.

    Returns new authentication tokens.
    """
    # Verify OTP
    otp_service = get_otp_service()
    if not await otp_service.verify_email_otp(request.email, request.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )

    # Get user and update password
    user = await get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.hashed_password = get_password_hash(request.new_password)
    user.last_password_change = datetime.now(timezone.utc)
    user.sign_in_attempts = 0
    user.is_locked = False
    user.locked_until = None

    await update_user(db, user)

    # Send confirmation email
    email_service = get_email_service()
    await email_service.send_password_changed_email(
        to_email=user.email,
        user_name=user.first_name,
    )

    # Generate new tokens
    settings = init_settings()
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires,
    )
    refresh_token = create_refresh_token(data={"sub": user.username})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


@router.post("/change-password", response_model=dict)
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Change password for authenticated user.

    Requires current password for verification.
    """
    # Verify current password
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect",
        )

    # Update password
    current_user.hashed_password = get_password_hash(request.new_password)
    current_user.last_password_change = datetime.now(timezone.utc)
    await update_user(db, current_user)

    # Send confirmation email
    email_service = get_email_service()
    await email_service.send_password_changed_email(
        to_email=current_user.email,
        user_name=current_user.first_name,
    )

    return {"message": "Password changed successfully"}


@router.get("/password-policy", response_model=PasswordPolicyResponse)
async def get_password_policy():
    """
    Get current password policy requirements.
    """
    settings = init_settings()
    return PasswordPolicyResponse(
        min_length=settings.PASSWORD_MIN_LENGTH,
        require_uppercase=settings.PASSWORD_REQUIRE_UPPERCASE,
        require_lowercase=settings.PASSWORD_REQUIRE_LOWERCASE,
        require_digits=settings.PASSWORD_REQUIRE_DIGITS,
        require_special_chars=settings.PASSWORD_REQUIRE_SPECIAL_CHARS,
    )


# ============================================================================
# TWO-FACTOR AUTHENTICATION (2FA)
# ============================================================================


@router.post("/2fa/enable", response_model=dict)
async def enable_2fa(
    request: Enable2FARequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Enable two-factor authentication.

    Supports email, SMS, or TOTP methods.
    """
    settings = init_settings()

    if not settings.TWO_FA_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not enabled on this server",
        )

    if request.method == "sms" and not request.phone_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number required for SMS 2FA",
        )

    # Update user 2FA settings
    current_user.two_factor_enabled = True
    current_user.two_factor_method = request.method
    if request.phone_number:
        current_user.phone_number = request.phone_number

    await update_user(db, current_user)

    # Send confirmation
    if request.method == "email":
        otp_service = get_otp_service()
        otp = await otp_service.send_email_otp(current_user.email)

        email_service = get_email_service()
        await email_service.send_2fa_otp_email(
            to_email=current_user.email,
            otp=otp,
            user_name=current_user.first_name,
        )

    elif request.method == "sms":
        otp_service = get_otp_service()
        otp = await otp_service.send_sms_otp(current_user.phone_number)

        sms_service = get_sms_service()
        await sms_service.send_otp_sms(current_user.phone_number, otp)

    elif request.method == "totp":
        import pyotp

        secret = pyotp.random_base32()
        current_user.totp_secret = secret
        await update_user(db, current_user)

        totp = pyotp.TOTP(secret)
        return {
            "message": "2FA enabled with TOTP",
            "secret": secret,
            "qr_code_url": totp.provisioning_uri(
                name=current_user.email,
                issuer_name=settings.APP_TITLE,
            ),
        }

    return {"message": f"2FA enabled with {request.method}"}


@router.post("/2fa/verify", response_model=TokenResponse)
async def verify_2fa(
    request: Verify2FARequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Verify 2FA code during sign in.

    Should be called after user provides username/password.
    """
    user = await get_user_by_email(db, request.email)
    if not user or not user.two_factor_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA not enabled for this user",
        )

    # Verify OTP
    otp_service = get_otp_service()
    if not await otp_service.verify_email_otp(request.email, request.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired 2FA code",
        )

    # Generate tokens
    settings = init_settings()
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires,
    )
    refresh_token = create_refresh_token(data={"sub": user.username})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


@router.post("/2fa/verify-totp", response_model=TokenResponse)
async def verify_totp(
    request: VerifyTOTPRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Verify TOTP code during sign in.
    """
    # This would need the user context, typically from JWT
    # For now, this is a placeholder
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="TOTP verification needs sign in context",
    )


@router.post("/2fa/disable", response_model=dict)
async def disable_2fa(
    request: Disable2FARequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Disable two-factor authentication.

    Requires current password for security.
    """
    # Verify password
    if not verify_password(request.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password is incorrect",
        )

    # Disable 2FA
    current_user.two_factor_enabled = False
    current_user.two_factor_method = None
    current_user.totp_secret = None
    current_user.backup_codes = None

    await update_user(db, current_user)

    return {"message": "2FA disabled successfully"}


# ============================================================================
# USER INFO & ACCOUNT
# ============================================================================


@router.get("/me", response_model=UserRead)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user),
):
    """
    Get current authenticated user information.
    """
    return current_user
