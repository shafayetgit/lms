"""Stripe payment gateway controller."""

import hashlib
import hmac

import httpx

from app.integrations.base import BaseGateway, CheckoutSession
from app.models.payment_gateway import PaymentGatewayConfig


class StripeGateway(BaseGateway):

    CHECKOUT_URL = "https://api.stripe.com/v1/checkout/sessions"

    def __init__(self, config: PaymentGatewayConfig):
        self.secret_key = config.stripe_secret_key
        self.publishable_key = config.stripe_publishable_key
        self.webhook_secret = config.stripe_webhook_secret or ""

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
        # Stripe amount is in the smallest currency unit (cents for USD)
        amount_cents = int(round(amount * 100))
        payload = {
            "payment_method_types[]": "card",
            "line_items[0][price_data][currency]": currency.lower(),
            "line_items[0][price_data][unit_amount]": amount_cents,
            "line_items[0][price_data][product_data][name]": description,
            "line_items[0][quantity]": 1,
            "mode": "payment",
            "success_url": success_url,
            "cancel_url": cancel_url,
            "client_reference_id": payment_public_id,
            "adaptive_pricing[enabled]": "false",
        }
        if customer_email:
            payload["customer_email"] = customer_email

        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    self.CHECKOUT_URL,
                    data=payload,
                    auth=(self.secret_key, ""),
                )
                resp.raise_for_status()
                data = resp.json()
        except httpx.HTTPStatusError as e:
            try:
                err_data = e.response.json()
                msg = err_data.get("error", {}).get("message", str(e))
            except Exception:
                msg = str(e)
            raise ValueError(f"Stripe error: {msg}")

        return CheckoutSession(
            checkout_url=data["url"],
            order_id=data["id"],  # Stripe session ID
        )

    async def create_payment_intent(
        self,
        payment_public_id: str,
        amount: float,
        currency: str,
        description: str,
        customer_email: str = None,
    ) -> dict:
        amount_cents = int(round(amount * 100))
        payload = {
            "amount": amount_cents,
            "currency": currency.lower(),
            "payment_method_types[]": "card",
            "metadata[payment_public_id]": payment_public_id,
            "description": description,
        }
        if customer_email:
            payload["receipt_email"] = customer_email

        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.stripe.com/v1/payment_intents",
                    data=payload,
                    auth=(self.secret_key, ""),
                )
                resp.raise_for_status()
                data = resp.json()
        except httpx.HTTPStatusError as e:
            try:
                err_data = e.response.json()
                msg = err_data.get("error", {}).get("message", str(e))
            except Exception:
                msg = str(e)
            raise ValueError(f"Stripe error: {msg}")

        return {
            "client_secret": data["client_secret"],
            "publishable_key": self.publishable_key,
            "payment_intent_id": data["id"],
        }

    async def verify_credentials(self) -> None:
        """Verify Stripe secret key by calling the Account retrieval endpoint."""
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://api.stripe.com/v1/account",
                auth=(self.secret_key, ""),
            )
        if resp.status_code == 401:
            raise ValueError("Stripe: invalid Secret Key — authentication failed")
        if resp.status_code not in (200, 400):
            # 400 can happen on test keys with restricted permissions — still means key is valid
            raise ValueError(f"Stripe: credential check failed (HTTP {resp.status_code})")

    def verify_webhook(self, payload: bytes, headers: dict) -> dict:
        """Verify Stripe webhook signature using Stripe-Signature header."""
        sig_header = headers.get("stripe-signature", "")
        if not sig_header:
            raise ValueError("Stripe: missing Stripe-Signature header")

        # Parse t= and v1= from the header
        parts = {k: v for part in sig_header.split(",") for k, v in [part.split("=", 1)]}
        timestamp = parts.get("t", "")
        signature = parts.get("v1", "")

        signed_payload = f"{timestamp}.{payload.decode()}"
        expected = hmac.new(
            self.webhook_secret.encode(), signed_payload.encode(), hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected, signature):
            raise ValueError("Stripe: webhook signature mismatch")

        import json
        event = json.loads(payload)
        event_type = event.get("type", "")
        obj = event.get("data", {}).get("object", {})

        if event_type in ("checkout.session.completed", "payment_intent.succeeded"):
            return {"order_id": obj.get("id", ""), "status": "success"}
        return {"order_id": obj.get("id", ""), "status": "failed"}

    async def check_payment_status(self, order_id: str) -> str:
        """Check status of a Stripe session or intent. Returns 'success' or 'pending'."""
        if not order_id:
            return "pending"
        async with httpx.AsyncClient() as client:
            try:
                if order_id.startswith("cs_"):
                    # Stripe Checkout Session
                    resp = await client.get(
                        f"https://api.stripe.com/v1/checkout/sessions/{order_id}",
                        auth=(self.secret_key, ""),
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        if data.get("payment_status") == "paid":
                            return "success"
                elif order_id.startswith("pi_"):
                    # Stripe PaymentIntent
                    resp = await client.get(
                        f"https://api.stripe.com/v1/payment_intents/{order_id}",
                        auth=(self.secret_key, ""),
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        if data.get("status") == "succeeded":
                            return "success"
            except Exception:
                pass
        return "pending"
