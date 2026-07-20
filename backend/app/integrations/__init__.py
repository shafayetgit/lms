"""Gateway factory — resolves a gateway name to its controller instance."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.payment_gateway import PaymentGatewayConfig, GatewayName
from app.integrations.base import BaseGateway


async def get_active_gateway(db: AsyncSession) -> BaseGateway:
    """Fetch the active gateway config and return its controller."""
    result = await db.execute(
        select(PaymentGatewayConfig).where(PaymentGatewayConfig.is_active == True)
    )
    config = result.scalar_one_or_none()
    if not config:
        raise ValueError("No active payment gateway configured.")

    return _build_controller(config)


async def get_gateway_by_name(db: AsyncSession, name: GatewayName) -> BaseGateway:
    """Fetch a specific gateway config and return its controller."""
    result = await db.execute(
        select(PaymentGatewayConfig).where(PaymentGatewayConfig.gateway == name)
    )
    config = result.scalar_one_or_none()
    if not config:
        raise ValueError(f"Gateway '{name}' is not configured.")

    return _build_controller(config)


def _build_controller(config: PaymentGatewayConfig) -> BaseGateway:
    if config.gateway == GatewayName.SSLCOMMERZ:
        from app.integrations.sslcommerz import SSLCommerzGateway
        return SSLCommerzGateway(config)
    elif config.gateway == GatewayName.STRIPE:
        from app.integrations.stripe import StripeGateway
        return StripeGateway(config)
    raise ValueError(f"Unsupported gateway: {config.gateway}")


async def verify_gateway_credentials(config) -> None:
    """Build a controller from config and verify its credentials against the live API."""
    controller = _build_controller(config)
    await controller.verify_credentials()
