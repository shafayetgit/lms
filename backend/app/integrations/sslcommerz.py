"""SSLCommerz payment gateway controller."""

import hashlib
import json
from urllib.parse import urlencode

import httpx

from app.integrations.base import BaseGateway, CheckoutSession
from app.models.payment_gateway import PaymentGatewayConfig


class SSLCommerzGateway(BaseGateway):

    SANDBOX_URL = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
    LIVE_URL = "https://securepay.sslcommerz.com/gwprocess/v4/api.php"

    def __init__(self, config: PaymentGatewayConfig):
        self.store_id = config.ssl_store_id
        self.store_password = config.ssl_store_password
        self.base_url = self.SANDBOX_URL if config.ssl_sandbox else self.LIVE_URL

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
        payload = {
            "store_id": self.store_id,
            "store_passwd": self.store_password,
            "total_amount": round(amount, 2),
            "currency": currency,
            "tran_id": payment_public_id,
            "success_url": success_url,
            "fail_url": cancel_url,
            "cancel_url": cancel_url,
            "cus_name": billing_name,
            "cus_email": customer_email or "noreply@lms.app",
            "cus_phone": "N/A",
            "cus_add1": "N/A",
            "cus_city": "N/A",
            "cus_country": "Bangladesh",
            "shipping_method": "NO",
            "num_of_item": 1,
            "product_name": description,
            "product_category": "Digital",
            "product_profile": "non-physical-goods",
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(self.base_url, data=payload)
            resp.raise_for_status()
            data = resp.json()

        if data.get("status") != "SUCCESS":
            raise ValueError(f"SSLCommerz session error: {data.get('failedreason')}")

        return CheckoutSession(
            checkout_url=data["GatewayPageURL"],
            order_id=data.get("sessionkey", payment_public_id),
        )

    async def verify_credentials(self) -> None:
        """Verify SSLCommerz credentials by calling the validation endpoint."""
        # SSLCommerz provides a validate endpoint that returns status with credentials
        validate_base = (
            "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php"
            if self.base_url == self.SANDBOX_URL
            else "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php"
        )
        params = {"val_id": "test", "store_id": self.store_id, "store_passwd": self.store_password, "format": "json"}
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(validate_base, params=params)

        # A 200 response with an error like "Invalid Transaction" means credentials are accepted
        # by the server. A 401/403 or "Invalid Store Credentials" means the store ID/password is wrong.
        if resp.status_code in (401, 403):
            raise ValueError("SSLCommerz: invalid Store ID or Store Password")
        try:
            data = resp.json()
        except Exception:
            return  # Cannot parse — assume credentials are structurally valid
        if "Invalid Store Credentials" in str(data.get("status", "")):
            raise ValueError("SSLCommerz: invalid Store ID or Store Password")

    def verify_webhook(self, payload: bytes, headers: dict) -> dict:
        """Verify IPN notification using MD5 hash check."""
        try:
            data = dict(
                pair.split("=", 1) for pair in payload.decode().split("&") if "=" in pair
            )
        except Exception:
            raise ValueError("SSLCommerz: malformed IPN payload")

        verify_sign = data.get("verify_sign", "")
        verify_key = data.get("verify_key", "")
        if not verify_sign or not verify_key:
            raise ValueError("SSLCommerz: missing verify_sign or verify_key")

        keys = verify_key.split(",")
        data["store_passwd"] = hashlib.md5(self.store_password.encode()).hexdigest()
        hash_str = "&".join(f"{k}={data.get(k, '')}" for k in sorted(keys + ["store_passwd"]))
        expected = hashlib.md5(hash_str.encode()).hexdigest()

        if expected != verify_sign:
            raise ValueError("SSLCommerz: IPN signature mismatch")

        status = "success" if data.get("status") == "VALID" else "failed"
        return {"order_id": data.get("tran_id", ""), "status": status}

    async def check_payment_status(self, order_id: str) -> str:
        """Check status of an SSLCommerz transaction. Returns 'success' or 'pending'."""
        if not order_id:
            return "pending"
        validate_base = (
            "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php"
            if self.base_url == self.SANDBOX_URL
            else "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php"
        )
        params = {
            "store_id": self.store_id,
            "store_passwd": self.store_password,
            "tran_id": order_id,
            "format": "json"
        }
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(validate_base, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    element = data
                    if isinstance(data, list) and len(data) > 0:
                        element = data[0]
                    if element.get("status") in ("VALID", "VALIDATED"):
                        return "success"
            except Exception:
                pass
        return "pending"
