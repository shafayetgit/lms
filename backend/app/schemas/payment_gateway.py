from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, field_validator, model_validator
from app.models.payment_gateway import GatewayName


class PaymentGatewayConfigCreate(BaseModel):
    gateway: GatewayName
    is_active: bool = False

    # SSLCommerz
    ssl_store_id: Optional[str] = None
    ssl_store_password: Optional[str] = None
    ssl_sandbox: bool = True

    # Stripe
    stripe_publishable_key: Optional[str] = None
    stripe_secret_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None

    @field_validator("stripe_publishable_key", mode="before")
    @classmethod
    def validate_stripe_pk(cls, v):
        if v and not v.startswith(("pk_live_", "pk_test_")):
            raise ValueError("Stripe publishable key must start with 'pk_live_' or 'pk_test_'")
        return v

    @field_validator("stripe_secret_key", mode="before")
    @classmethod
    def validate_stripe_sk(cls, v):
        if v and not v.startswith(("sk_live_", "sk_test_")):
            raise ValueError("Stripe secret key must start with 'sk_live_' or 'sk_test_'")
        return v

    @field_validator("stripe_webhook_secret", mode="before")
    @classmethod
    def validate_stripe_wh(cls, v):
        if v and not v.startswith("whsec_"):
            raise ValueError("Stripe webhook secret must start with 'whsec_'")
        return v

    @model_validator(mode="after")
    def validate_required_fields_by_gateway(self):
        if self.gateway == GatewayName.SSLCOMMERZ:
            if not self.ssl_store_id or not self.ssl_store_password:
                raise ValueError("SSLCommerz requires both Store ID and Store Password")
        elif self.gateway == GatewayName.STRIPE:
            if not self.stripe_publishable_key or not self.stripe_secret_key:
                raise ValueError("Stripe requires both Publishable Key and Secret Key")
        return self


class PaymentGatewayConfigUpdate(BaseModel):
    is_active: Optional[bool] = None
    ssl_store_id: Optional[str] = None
    ssl_store_password: Optional[str] = None
    ssl_sandbox: Optional[bool] = None
    stripe_publishable_key: Optional[str] = None
    stripe_secret_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None

    @field_validator("stripe_publishable_key", mode="before")
    @classmethod
    def validate_stripe_pk(cls, v):
        if v and not v.startswith(("pk_live_", "pk_test_")):
            raise ValueError("Stripe publishable key must start with 'pk_live_' or 'pk_test_'")
        return v

    @field_validator("stripe_secret_key", mode="before")
    @classmethod
    def validate_stripe_sk(cls, v):
        if v and not v.startswith(("sk_live_", "sk_test_")):
            raise ValueError("Stripe secret key must start with 'sk_live_' or 'sk_test_'")
        return v

    @field_validator("stripe_webhook_secret", mode="before")
    @classmethod
    def validate_stripe_wh(cls, v):
        if v and not v.startswith("whsec_"):
            raise ValueError("Stripe webhook secret must start with 'whsec_'")
        return v


class PaymentGatewayConfigResponse(BaseModel):
    id: int
    public_id: str
    gateway: GatewayName
    is_active: bool
    ssl_store_id: Optional[str] = None
    ssl_sandbox: bool = True
    stripe_publishable_key: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
