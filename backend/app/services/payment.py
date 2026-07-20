from datetime import date
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.models.payment import Coupon, CouponItem, Payment, CouponType, PaymentForType, PaymentStatus
from app.schemas.payment import (
    CouponCreate,
    CouponUpdate,
    PaymentCreate,
    PaymentUpdate,
    ApplyCouponRequest,
    ApplyCouponResponse
)
from app.repositories import payment as payment_repo

# ---------------- COUPONS ---------------- #

async def create_coupon(db: AsyncSession, coupon_in: CouponCreate) -> Coupon:
    existing = await payment_repo.get_coupon_by_code(db, coupon_in.code)
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    
    coupon_data = coupon_in.model_dump(exclude={"applicable_items"})
    coupon = Coupon(**coupon_data)
    
    if coupon_in.applicable_items:
        coupon.applicable_items = [
            CouponItem(**item.model_dump()) for item in coupon_in.applicable_items
        ]
        
    return await payment_repo.create_coupon(db, coupon)

async def update_coupon(
    db: AsyncSession, coupon: Coupon, coupon_in: CouponUpdate
) -> Coupon:
    if coupon_in.code and coupon_in.code != coupon.code:
        existing = await payment_repo.get_coupon_by_code(db, coupon_in.code)
        if existing:
            raise HTTPException(status_code=400, detail="Coupon code already exists")
            
    update_data = coupon_in.model_dump(exclude_unset=True, exclude={"applicable_items"})
    for field, value in update_data.items():
        setattr(coupon, field, value)

    if coupon_in.applicable_items is not None:
        coupon.applicable_items = [
            CouponItem(**item.model_dump()) for item in coupon_in.applicable_items
        ]
        
    return await payment_repo.update_coupon(db, coupon)


async def validate_coupon(
    db: AsyncSession,
    code: str,
    payment_for_type: Optional[PaymentForType] = None,
    payment_for_id: Optional[int] = None
) -> Coupon:
    coupon = await payment_repo.get_coupon_by_code(db, code)
    if not coupon:
        raise HTTPException(status_code=404, detail=f"The coupon code '{code}' is invalid.")
        
    if not coupon.is_active:
        raise HTTPException(status_code=400, detail="This coupon is inactive.")
        
    if coupon.validity and coupon.validity < date.today():
        raise HTTPException(status_code=400, detail="This coupon has expired.")
        
    if coupon.max_uses is not None and coupon.used_count >= coupon.max_uses:
        raise HTTPException(status_code=400, detail="This coupon has reached its maximum usage limit.")
        
    if coupon.applicable_items and payment_for_type is not None and payment_for_id is not None:
        is_applicable = any(
            item.reference_type == payment_for_type and item.reference_id == payment_for_id
            for item in coupon.applicable_items
        )
        if not is_applicable:
            raise HTTPException(
                status_code=400,
                detail=f"This coupon is not applicable to this {payment_for_type.value}."
            )

    return coupon

async def calculate_discount(db: AsyncSession, request: ApplyCouponRequest) -> ApplyCouponResponse:
    coupon = await validate_coupon(
        db,
        code=request.code,
        payment_for_type=request.payment_for_type,
        payment_for_id=request.payment_for_id,
    )
    
    discount_amount = 0.0
    if coupon.type == CouponType.PERCENT:
        discount_amount = (coupon.discount / 100.0) * request.amount
    elif coupon.type == CouponType.AMOUNT:
        discount_amount = coupon.discount
        
    # Ensure discount doesn't exceed original amount
    discount_amount = min(discount_amount, request.amount)
    final_amount = max(request.amount - discount_amount, 0.0)
    
    return ApplyCouponResponse(
        discount_amount=discount_amount,
        final_amount=final_amount,
        coupon_id=coupon.id
    )


# ---------------- PAYMENTS ---------------- #

async def process_payment(db: AsyncSession, payment_in: PaymentCreate) -> Payment:
    payment = Payment(**payment_in.model_dump())
    
    if payment.coupon_id:
        coupon = await payment_repo.get_coupon_by_id(db, payment.coupon_id)
        if coupon:
            coupon.used_count += 1
            await payment_repo.update_coupon(db, coupon)
            
    return await payment_repo.create_payment(db, payment)

async def update_payment_status(
    db: AsyncSession, payment: Payment, update_in: PaymentUpdate
) -> Payment:
    if update_in.status:
        payment.status = update_in.status
    if update_in.payment_id:
        payment.payment_id = update_in.payment_id
        
    return await payment_repo.update_payment(db, payment)
