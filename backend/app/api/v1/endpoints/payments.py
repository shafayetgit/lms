from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import get_current_user
from app.core.responses import create_response, read_response, update_response, delete_response
from app.models.user import User
from app.schemas.payment import (
    CouponCreate,
    CouponUpdate,
    CouponResponse,
    PaymentCreate,
    PaymentUpdate,
    PaymentResponse,
    ApplyCouponRequest,
    ApplyCouponResponse,
    CheckoutLinkRequest,
    CheckoutLinkResponse
)
from app.repositories import payment as payment_repo
from app.services import payment as payment_svc

router = APIRouter()

# ---------------- COUPONS ---------------- #

@router.post("/coupons", status_code=status.HTTP_201_CREATED)
async def create_coupon(
    *,
    db: AsyncSession = Depends(get_db),
    coupon_in: CouponCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    coupon = await payment_svc.create_coupon(db, coupon_in=coupon_in)
    return create_response(CouponResponse.model_validate(coupon).model_dump(by_alias=True))

@router.get("/coupons")
async def read_coupons(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    total = await payment_repo.count_coupons(db)
    coupons = await payment_repo.get_coupons(db, skip=skip, limit=limit)
    items = [CouponResponse.model_validate(c).model_dump(by_alias=True) for c in coupons]
    return read_response({"data": items, "meta": {"total": total, "skip": skip, "limit": limit}})

@router.put("/coupons/{id}")
async def update_coupon(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    coupon_in: CouponUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    coupon = await payment_repo.get_coupon_by_id(db, id)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
        
    updated = await payment_svc.update_coupon(db, coupon=coupon, coupon_in=coupon_in)
    return update_response(CouponResponse.model_validate(updated).model_dump(by_alias=True))

@router.delete("/coupons/{id}")
async def delete_coupon(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    coupon = await payment_repo.get_coupon_by_id(db, id)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
        
    await payment_repo.delete_coupon(db, coupon=coupon)
    return delete_response("Successfully deleted")

@router.post("/coupons/validate")
async def validate_coupon(
    *,
    db: AsyncSession = Depends(get_db),
    request_in: ApplyCouponRequest,
    current_user: User = Depends(get_current_user)
) -> Any:
    res = await payment_svc.calculate_discount(db, request_in)
    return create_response(res.model_dump())


# ---------------- PAYMENTS ---------------- #

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_payment(
    *,
    db: AsyncSession = Depends(get_db),
    payment_in: PaymentCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    if payment_in.member_id != current_user.id and current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Cannot create payment for another user")
    payment = await payment_svc.process_payment(db, payment_in=payment_in)
    return create_response(PaymentResponse.model_validate(payment).model_dump(by_alias=True))

@router.get("/")
async def read_payments(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 10,
    member_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    payment_for_type: Optional[str] = None,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role == "student":
        member_id = current_user.id
        
    total = await payment_repo.count_payments(db, member_id=member_id, status=status_filter, payment_for_type=payment_for_type)
    payments = await payment_repo.get_payments(db, skip=skip, limit=limit, member_id=member_id, status=status_filter, payment_for_type=payment_for_type)
    
    import math
    pages = math.ceil(total / limit) if limit > 0 else 1
    page = (skip // limit) + 1 if limit > 0 else 1
    items = [PaymentResponse.model_validate(p).model_dump(by_alias=True) for p in payments]
    
    return read_response({
        "data": items,
        "meta": {
            "total": total,
            "page": page,
            "size": limit,
            "pages": pages,
            "has_next": skip + limit < total,
            "has_prev": skip > 0
        }
    })

@router.get("/public/{public_id}")
async def read_payment_by_public_id(
    *,
    db: AsyncSession = Depends(get_db),
    public_id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    payment = await payment_repo.get_payment_by_public_id(db, public_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if current_user.role == "student" and payment.member_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    from app.models.payment import PaymentStatus
    if payment.status == PaymentStatus.PENDING and payment.order_id:
        try:
            from app.integrations import get_active_gateway
            from app.api.v1.endpoints.payment_gateways import _complete_enrollment
            gateway = await get_active_gateway(db)
            status = await gateway.check_payment_status(payment.order_id)
            if status == "success":
                payment.status = PaymentStatus.COMPLETED
                await db.commit()
                await _complete_enrollment(db, payment)
        except Exception as e:
            print(f"Error checking payment status: {e}")

    from app.repositories import course as course_repo
    from app.repositories import batch as batch_repo
    from app.models.payment import PaymentForType

    item_details = None
    if payment.payment_for_type == PaymentForType.COURSE:
        course = await course_repo.get_course_by_id(db, payment.payment_for_id)
        if course:
            item_details = {
                "title": course.title,
                "banner": course.thumbnail,
                "description": course.overview or "",
                "total_lessons": course.total_lessons or 0,
                "total_quizzes": course.total_quizzes or 0,
                "paid_course": course.paid_course,
            }
    elif payment.payment_for_type == PaymentForType.BATCH:
        batch = await batch_repo.get_batch_by_id(db, payment.payment_for_id)
        if batch:
            item_details = {
                "title": batch.name,
                "banner": None,
                "description": batch.description or "",
                "total_lessons": 0,
                "total_quizzes": 0,
                "paid_course": batch.paid_batch,
            }

    resp = PaymentResponse.model_validate(payment)
    resp.item_details = item_details

    return read_response({"data": resp.model_dump(by_alias=True)})


@router.get("/{id}")
async def read_payment(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user)
) -> Any:
    payment = await payment_repo.get_payment_by_id(db, id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
        
    if current_user.role == "student" and payment.member_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return read_response({"data": PaymentResponse.model_validate(payment).model_dump(by_alias=True)})

@router.put("/{public_id}/status")
async def update_payment_status(
    *,
    db: AsyncSession = Depends(get_db),
    public_id: str,
    update_in: PaymentUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    payment = await payment_repo.get_payment_by_public_id(db, public_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
        
    updated = await payment_svc.update_payment_status(db, payment=payment, update_in=update_in)
    return update_response(PaymentResponse.model_validate(updated).model_dump(by_alias=True))


@router.post("/checkout-link")
async def get_checkout_link(
    *,
    db: AsyncSession = Depends(get_db),
    request_in: CheckoutLinkRequest,
    current_user: User = Depends(get_current_user)
) -> Any:
    from app.repositories import course as course_repo
    from app.repositories import batch as batch_repo
    from app.repositories import enrollment as enrollment_repo
    from app.models.payment import Payment, PaymentForType, PaymentStatus
    from app.models.enrollment import Enrollment, EnrollmentStatus
    from app.models.batch import BatchEnrollment

    course = None
    batch = None

    # 1. Fetch the target Course or Batch
    if request_in.payment_for_type == PaymentForType.COURSE:
        course = await course_repo.get_course_by_public_id(db, request_in.payment_for_public_id)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Check if already enrolled
        existing = await enrollment_repo.get_enrollment_by_user_and_course(db, current_user.id, course.id)
        if existing:
            raise HTTPException(status_code=400, detail="You are already enrolled in this course.")
            
        original_amount = course.course_price if course.paid_course else 0.0
        currency = course.currency or "USD"
        target_id = course.id
        redirect_success = f"/lms/courses/{course.slug}"

    elif request_in.payment_for_type == PaymentForType.BATCH:
        batch = await batch_repo.get_batch_by_id(db, request_in.payment_for_public_id)
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
            
        # Check if already enrolled
        existing = await batch_repo.get_enrollment(db, batch.id, current_user.id)
        if existing:
            raise HTTPException(status_code=400, detail="You are already enrolled in this batch.")
            
        original_amount = batch.amount if batch.paid_batch else 0.0
        currency = batch.currency or "USD"
        target_id = batch.id
        redirect_success = f"/lms/batches/{batch.public_id}/dashboard"
        
    else:
        raise HTTPException(status_code=400, detail="Invalid payment type")

    # 2. Coupon Calculations
    discount_amount = 0.0
    amount = original_amount
    coupon_id = None
    coupon = None
    
    if request_in.coupon_code:
        coupon = await payment_svc.validate_coupon(
            db,
            code=request_in.coupon_code,
            payment_for_type=request_in.payment_for_type,
            payment_for_id=target_id
        )
        # Calculate discount
        from app.models.payment import CouponType
        if coupon.type == CouponType.PERCENT:
            discount_amount = (coupon.discount / 100.0) * original_amount
        elif coupon.type == CouponType.AMOUNT:
            discount_amount = coupon.discount
            
        discount_amount = min(discount_amount, original_amount)
        amount = max(original_amount - discount_amount, 0.0)
        coupon_id = coupon.id

    # 3. Create Payment Transaction
    is_completed = (amount <= 0.0)
    payment = Payment(
        member_id=current_user.id,
        billing_name=request_in.billing_name,
        payment_for_type=request_in.payment_for_type,
        payment_for_id=target_id,
        currency=currency,
        amount=amount,
        original_amount=original_amount,
        discount_amount=discount_amount,
        coupon_id=coupon_id,
        source=request_in.source,
        status=PaymentStatus.COMPLETED if is_completed else PaymentStatus.PENDING,
        billing_address_line_1=request_in.billing_address_line_1,
        billing_address_line_2=request_in.billing_address_line_2,
        billing_city=request_in.billing_city,
        billing_state=request_in.billing_state,
        billing_country=request_in.billing_country,
        billing_postal_code=request_in.billing_postal_code,
        billing_phone=request_in.billing_phone,
        where_heard=request_in.where_heard,
        consent_invoicing=request_in.consent_invoicing,
    )
    
    if coupon_id and coupon:
        coupon.used_count += 1
        
    db.add(payment)
    await db.commit()
    await db.refresh(payment)

    # 4. Handle Free Enrollment Immediate Bypass
    if is_completed:
        if request_in.payment_for_type == PaymentForType.COURSE:
            enrollment = Enrollment(
                course_id=target_id,
                user_id=current_user.id,
                payment_id=payment.id,
                status=EnrollmentStatus.ACTIVE,
                is_active=True
            )
            db.add(enrollment)
            if course:
                course.total_enrollments = (course.total_enrollments or 0) + 1
        elif request_in.payment_for_type == PaymentForType.BATCH:
            enrollment = BatchEnrollment(
                batch_id=target_id,
                member_id=current_user.id,
                is_paid=True
            )
            db.add(enrollment)
            
        await db.commit()
        redirect_url = redirect_success
    else:
        redirect_url = f"/payments/checkout?payment_public_id={payment.public_id}"

    return create_response({
        "redirect_url": redirect_url,
        "payment": PaymentResponse.model_validate(payment).model_dump(by_alias=True)
    })


