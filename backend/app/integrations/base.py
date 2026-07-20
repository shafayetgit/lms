"""Abstract base class for all payment gateway controllers."""

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class CheckoutSession:
    checkout_url: str      # URL to redirect the student to
    order_id: str          # Gateway's order/session ID (stored on Payment.order_id)


class BaseGateway(ABC):
    """Every gateway must implement these two methods."""

    @abstractmethod
    async def verify_credentials(self) -> None:
        """
        Verify that the stored credentials are valid by calling the gateway API.
        Raises ValueError with a human-readable message on failure.
        """
        ...

    @abstractmethod
    async def create_checkout_session(
        self,
        payment_public_id: str,
        amount: float,
        currency: str,
        billing_name: str,
        description: str,
        success_url: str,
        cancel_url: str,
        customer_email: str = None,
    ) -> CheckoutSession:
        """Create a hosted checkout session and return the redirect URL."""
        ...

    @abstractmethod
    def verify_webhook(self, payload: bytes, headers: dict) -> dict:
        """
        Verify and parse an incoming webhook payload.
        Returns a normalized dict: { "order_id": str, "status": "success" | "failed" }
        Raises ValueError on signature mismatch.
        """
        ...

    async def create_payment_intent(
        self,
        payment_public_id: str,
        amount: float,
        currency: str,
        description: str,
        customer_email: str = None,
    ) -> dict:
        """Create a payment intent for inline payment (if supported)."""
        raise NotImplementedError("This gateway does not support inline payment intents.")

    async def check_payment_status(self, order_id: str) -> str:
        """Check status of a session/intent. Returns 'success', 'failed', or 'pending'."""
        return "pending"
