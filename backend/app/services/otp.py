"""
OTP (One-Time Password) Service
Handles generation, validationand storage of OTP codes for email and SMS verification.
"""

import secrets
import hmac
import redis.asyncio as redis
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.core.config import init_settings


class OTPService:
    """Service for managing OTP generation and validation."""

    def __init__(self, redis_client: Optional[redis.Redis] = None):
        """Initialize OTP service with optional Redis client."""
        self.redis_client = redis_client
        self.settings = init_settings()

    async def _get_redis_client(self) -> redis.Redis:
        """Get or create Redis client."""
        if self.redis_client is None:
            self.redis_client = await redis.from_url(
                self.settings.REDIS_URL, decode_responses=True
            )
        return self.redis_client

    async def generate_otp(self) -> str:
        """
        Generate a secure random OTP code.
        
        Returns:
            str: OTP code of specified length (default 6 digits)
        """
        return "".join(
            secrets.choice("0123456789") for _ in range(self.settings.OTP_LENGTH)
        )

    async def send_email_otp(self, email: str) -> str:
        email = email.lower().strip()
        
        redis_client = await self._get_redis_client()
        
        cooldown_key = f"otp:email:cooldown:{email}"
        if await redis_client.exists(cooldown_key):
            raise Exception("Please wait before requesting another OTP")
        
        attempt_key = f"otp:email:attempts:{email}"
        attempts = await redis_client.incr(attempt_key)
        
        if attempts == 1:
            await redis_client.expire(attempt_key, 3600)
        
        if attempts > self.settings.OTP_RESEND_MAX_ATTEMPTS:
            raise Exception("Too many OTP requests")
        
        otp = await self.generate_otp()
        
        key = f"otp:email:{email}"
        await redis_client.setex(
            key,
            self.settings.OTP_EXPIRE_MINUTES * 60,
            otp,
        )
        
        await redis_client.setex(
            cooldown_key,
            self.settings.OTP_RESEND_COOLDOWN_SECONDS,
            "1",
        )
        
        return otp
    
    async def send_sms_otp(self, phone_number: str) -> str:
        """
        Generate and store OTP for SMS verification.
        
        Args:
            phone_number: User's phone number
            
        Returns:
            str: Generated OTP
        """
        otp = await self.generate_otp()
        redis_client = await self._get_redis_client()
        
        key = f"otp:sms:{phone_number}"
        await redis_client.setex(
            key,
            self.settings.OTP_EXPIRE_MINUTES * 60,
            otp,
        )
        
        # Store attempt count
        attempt_key = f"otp:sms:attempts:{phone_number}"
        attempts = await redis_client.incr(attempt_key)
        if attempts == 1:
            await redis_client.expire(
                attempt_key,
                3600,  # 1 hour window for attempt counting
            )
        
        # Store cooldown timer for resend
        cooldown_key = f"otp:sms:cooldown:{phone_number}"
        await redis_client.setex(
            cooldown_key,
            self.settings.OTP_RESEND_COOLDOWN_SECONDS,
            "1",
        )
        
        return otp


    async def verify_email_otp(self, email: str, otp: str) -> bool:
        email = email.lower().strip()
        
        redis_client = await self._get_redis_client()
        key = f"otp:email:{email}"
        
        stored_otp = await redis_client.get(key)

        if not stored_otp:
            return False

        if hmac.compare_digest(str(stored_otp), str(otp)):
            # cleanup
            await redis_client.delete(key)
            await redis_client.delete(f"otp:email:cooldown:{email}")
            await redis_client.delete(f"otp:email:attempts:{email}")
            return True
        
        return False

    async def verify_sms_otp(self, phone_number: str, otp: str) -> bool:
            """
            Verify SMS OTP.
            
            Args:
                phone_number: User's phone number
                otp: OTP code to verify
                
            Returns:
                bool: True if OTP is valid, False otherwise
            """
            redis_client = await self._get_redis_client()
            key = f"otp:sms:{phone_number}"
            
            stored_otp = await redis_client.get(key)
            if stored_otp and stored_otp == otp:
                # Delete OTP after successful verification
                await redis_client.delete(key)
                return True
            
            return False

    async def get_otp_attempts(self, email: str) -> int:
        """Get number of OTP send attempts in current window."""
        redis_client = await self._get_redis_client()
        attempt_key = f"otp:email:attempts:{email}"
        attempts = await redis_client.get(attempt_key)
        return int(attempts) if attempts else 0

    async def get_sms_otp_attempts(self, phone_number: str) -> int:
        """Get number of SMS OTP send attempts in current window."""
        redis_client = await self._get_redis_client()
        attempt_key = f"otp:sms:attempts:{phone_number}"
        attempts = await redis_client.get(attempt_key)
        return int(attempts) if attempts else 0

    async def is_email_otp_on_cooldown(self, email: str) -> bool:
        """Check if email OTP resend is on cooldown."""
        redis_client = await self._get_redis_client()
        cooldown_key = f"otp:email:cooldown:{email}"
        return await redis_client.exists(cooldown_key) > 0

    async def is_sms_otp_on_cooldown(self, phone_number: str) -> bool:
        """Check if SMS OTP resend is on cooldown."""
        redis_client = await self._get_redis_client()
        cooldown_key = f"otp:sms:cooldown:{phone_number}"
        return await redis_client.exists(cooldown_key) > 0

    async def clear_email_otp(self, email: str):
        """Clear OTP and cooldown for email."""
        redis_client = await self._get_redis_client()
        await redis_client.delete(f"otp:email:{email}")
        await redis_client.delete(f"otp:email:cooldown:{email}")
        await redis_client.delete(f"otp:email:attempts:{email}")

    async def clear_sms_otp(self, phone_number: str):
        """Clear OTP and cooldown for SMS."""
        redis_client = await self._get_redis_client()
        await redis_client.delete(f"otp:sms:{phone_number}")
        await redis_client.delete(f"otp:sms:cooldown:{phone_number}")
        await redis_client.delete(f"otp:sms:attempts:{phone_number}")


# Global OTP service instance
_otp_service: Optional[OTPService] = None


def get_otp_service() -> OTPService:
    """Get OTP service instance."""
    global _otp_service
    if _otp_service is None:
        _otp_service = OTPService()
    return _otp_service
