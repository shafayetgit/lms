import enum
from typing import Optional
from sqlalchemy import Boolean, String, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class GatewayName(str, enum.Enum):
    SSLCOMMERZ = "SSLCommerz"
    STRIPE = "Stripe"


class PaymentGatewayConfig(Base):
    __tablename__ = "payment_gateway_configs"

    gateway: Mapped[GatewayName] = mapped_column(
        SQLEnum(GatewayName, name="gateway_name_enum", values_callable=lambda x: [e.value for e in x]),
        unique=True,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)

    # SSLCommerz fields
    ssl_store_id: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    ssl_store_password: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    ssl_sandbox: Mapped[bool] = mapped_column(Boolean, default=True)

    # Stripe fields
    stripe_publishable_key: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    stripe_secret_key: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    stripe_webhook_secret: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
