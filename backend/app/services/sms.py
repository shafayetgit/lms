"""
SMS Service
Handles sending SMS messages via Twilio or Vonage.
"""

from typing import Optional
from app.core.config import init_settings


class SMSService:
    """Service for sending SMS messages."""

    def __init__(self):
        """Initialize SMS service with Twilio or Vonage."""
        self.settings = init_settings()
        self.provider = self.settings.SMS_PROVIDER.lower()
        
        if self.provider == "twilio":
            self._init_twilio()
        elif self.provider == "vonage":
            self._init_vonage()

    def _init_twilio(self):
        """Initialize Twilio client."""
        try:
            from twilio.rest import Client
            self.client = Client(
                self.settings.TWILIO_ACCOUNT_SID,
                self.settings.TWILIO_AUTH_TOKEN,
            )
        except ImportError:
            raise ImportError(
                "twilio package is required. Install it with: pip install twilio"
            )

    def _init_vonage(self):
        """Initialize Vonage client."""
        try:
            import vonage
            self.client = vonage.Client(
                api_key=self.settings.VONAGE_API_KEY,
                api_secret=self.settings.VONAGE_API_SECRET,
            )
        except ImportError:
            raise ImportError(
                "vonage package is required. Install it with: pip install vonage"
            )

    async def send_sms(
        self,
        phone_number: str,
        message: str,
    ) -> bool:
        """
        Send SMS message.
        
        Args:
            phone_number: Recipient's phone number (E.164 format: +1234567890)
            message: Message content
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        try:
            if self.provider == "twilio":
                return await self._send_twilio_sms(phone_number, message)
            elif self.provider == "vonage":
                return await self._send_vonage_sms(phone_number, message)
            else:
                raise ValueError(f"Unsupported SMS provider: {self.provider}")
        except Exception as e:
            print(f"Error sending SMS: {e}")
            return False

    async def _send_twilio_sms(self, phone_number: str, message: str) -> bool:
        """Send SMS via Twilio."""
        try:
            msg = self.client.messages.create(
                body=message,
                from_=self.settings.TWILIO_PHONE_NUMBER,
                to=phone_number,
            )
            return msg.sid is not None
        except Exception as e:
            print(f"Twilio SMS error: {e}")
            return False

    async def _send_vonage_sms(self, phone_number: str, message: str) -> bool:
        """Send SMS via Vonage."""
        try:
            response = self.client.sms.send_message(
                {
                    "to": phone_number,
                    "from": "LMS",
                    "text": message,
                }
            )
            return response["messages"][0]["status"] == "0"
        except Exception as e:
            print(f"Vonage SMS error: {e}")
            return False

    async def send_otp_sms(self, phone_number: str, otp: str) -> bool:
        """
        Send OTP via SMS.
        
        Args:
            phone_number: Recipient's phone number
            otp: OTP code
            
        Returns:
            bool: True if sent successfully
        """
        message = f"Your verification code is: {otp}. Valid for 10 minutes. Do not share with anyone."
        return await self.send_sms(phone_number, message)

    async def send_password_reset_sms(self, phone_number: str, otp: str) -> bool:
        """
        Send password reset OTP via SMS.
        
        Args:
            phone_number: Recipient's phone number
            otp: OTP code
            
        Returns:
            bool: True if sent successfully
        """
        message = f"Your password reset code is: {otp}. Valid for 10 minutes. Ignore if you didn't request this."
        return await self.send_sms(phone_number, message)


# Global SMS service instance
_sms_service: Optional[SMSService] = None


def get_sms_service() -> SMSService:
    """Get SMS service instance."""
    global _sms_service
    if _sms_service is None:
        _sms_service = SMSService()
    return _sms_service
