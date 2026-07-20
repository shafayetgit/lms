from typing import Sequence, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.payment import Coupon, Payment

# ---------------- COUPONS ---------------- #

async def create_coupon(db: AsyncSession, coupon: Coupon) -> Coupon:
    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)
    return coupon

async def get_coupon_by_id(db: AsyncSession, id: int) -> Optional[Coupon]:
    query = select(Coupon).where(Coupon.id == id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_coupon_by_code(db: AsyncSession, code: str) -> Optional[Coupon]:
    query = select(Coupon).where(Coupon.code == code)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_coupons(db: AsyncSession, skip: int = 0, limit: int = 10) -> Sequence[Coupon]:
    query = select(Coupon).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def count_coupons(db: AsyncSession) -> int:
    query = select(func.count(Coupon.id))
    result = await db.execute(query)
    return result.scalar() or 0

async def update_coupon(db: AsyncSession, coupon: Coupon) -> Coupon:
    await db.commit()
    await db.refresh(coupon)
    return coupon

async def delete_coupon(db: AsyncSession, coupon: Coupon) -> None:
    await db.delete(coupon)
    await db.commit()


# ---------------- PAYMENTS ---------------- #

async def create_payment(db: AsyncSession, payment: Payment) -> Payment:
    db.add(payment)
    await db.commit()
    return await get_payment_by_id(db, payment.id)

async def get_payment_by_id(db: AsyncSession, id: int) -> Optional[Payment]:
    query = select(Payment).options(
        selectinload(Payment.member),
        selectinload(Payment.coupon)
    ).where(Payment.id == id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

from sqlalchemy.orm import selectinload

async def get_payment_by_public_id(db: AsyncSession, public_id: str) -> Optional[Payment]:
    query = select(Payment).options(
        selectinload(Payment.member),
        selectinload(Payment.coupon)
    ).where(Payment.public_id == public_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_payments(
    db: AsyncSession, skip: int = 0, limit: int = 10, member_id: Optional[int] = None, 
    status: Optional[str] = None, payment_for_type: Optional[str] = None
) -> Sequence[Payment]:
    query = select(Payment).options(
        selectinload(Payment.member),
        selectinload(Payment.coupon)
    )
    if member_id is not None:
        query = query.where(Payment.member_id == member_id)
    if status is not None:
        query = query.where(Payment.status == status)
    if payment_for_type is not None:
        query = query.where(Payment.payment_for_type == payment_for_type)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def count_payments(
    db: AsyncSession, member_id: Optional[int] = None, status: Optional[str] = None, payment_for_type: Optional[str] = None
) -> int:
    query = select(func.count(Payment.id))
    if member_id is not None:
        query = query.where(Payment.member_id == member_id)
    if status is not None:
        query = query.where(Payment.status == status)
    if payment_for_type is not None:
        query = query.where(Payment.payment_for_type == payment_for_type)
    result = await db.execute(query)
    return result.scalar() or 0

async def update_payment(db: AsyncSession, payment: Payment) -> Payment:
    await db.commit()
    return await get_payment_by_id(db, payment.id)
