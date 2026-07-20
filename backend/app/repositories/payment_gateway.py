from typing import Optional, Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payment_gateway import PaymentGatewayConfig, GatewayName


async def get_all(db: AsyncSession) -> Sequence[PaymentGatewayConfig]:
    result = await db.execute(select(PaymentGatewayConfig))
    return result.scalars().all()


async def get_by_gateway(db: AsyncSession, gateway: GatewayName) -> Optional[PaymentGatewayConfig]:
    result = await db.execute(
        select(PaymentGatewayConfig).where(PaymentGatewayConfig.gateway == gateway)
    )
    return result.scalar_one_or_none()


async def get_active(db: AsyncSession) -> Optional[PaymentGatewayConfig]:
    result = await db.execute(
        select(PaymentGatewayConfig).where(PaymentGatewayConfig.is_active == True)
    )
    return result.scalar_one_or_none()


async def create(db: AsyncSession, config: PaymentGatewayConfig) -> PaymentGatewayConfig:
    db.add(config)
    await db.commit()
    await db.refresh(config)
    return config


async def update(db: AsyncSession, config: PaymentGatewayConfig) -> PaymentGatewayConfig:
    await db.commit()
    await db.refresh(config)
    return config


async def delete(db: AsyncSession, config: PaymentGatewayConfig) -> None:
    await db.delete(config)
    await db.commit()
