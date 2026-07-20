"""
Payment gateway admin config and public checkout/webhook endpoints.
"""

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.payment import Payment, PaymentStatus
from app.models.payment_gateway import PaymentGatewayConfig, GatewayName
from app.schemas.payment_gateway import (
    PaymentGatewayConfigCreate,
    PaymentGatewayConfigUpdate,
    PaymentGatewayConfigResponse,
)
from app.repositories import payment_gateway as gw_repo
from app.integrations import get_active_gateway, get_gateway_by_name, verify_gateway_credentials

router = APIRouter()


# ─── Admin: CRUD for gateway configs ────────────────────────────────────────

@router.get("/", response_model=list[PaymentGatewayConfigResponse])
async def list_gateway_configs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    if current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return await gw_repo.get_all(db)


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=PaymentGatewayConfigResponse)
async def create_gateway_config(
    *,
    db: AsyncSession = Depends(get_db),
    config_in: PaymentGatewayConfigCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    if current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    existing = await gw_repo.get_by_gateway(db, config_in.gateway)
    if existing:
        raise HTTPException(status_code=400, detail=f"Config for {config_in.gateway} already exists. Use PUT to update.")

    # Only one gateway can be active at a time
    if config_in.is_active:
        active = await gw_repo.get_active(db)
        if active:
            active.is_active = False

    config = PaymentGatewayConfig(**config_in.model_dump())

    # Verify credentials against the live gateway API before persisting
    try:
        await verify_gateway_credentials(config)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception:
        raise HTTPException(status_code=502, detail="Could not reach the payment gateway to verify credentials. Check your network or try again.")

    return await gw_repo.create(db, config)


@router.put("/{gateway}", response_model=PaymentGatewayConfigResponse)
async def update_gateway_config(
    *,
    db: AsyncSession = Depends(get_db),
    gateway: GatewayName,
    config_in: PaymentGatewayConfigUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    if current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    config = await gw_repo.get_by_gateway(db, gateway)
    if not config:
        raise HTTPException(status_code=404, detail="Gateway config not found")

    # Enforce single active gateway
    if config_in.is_active:
        active = await gw_repo.get_active(db)
        if active and active.id != config.id:
            active.is_active = False

    update_data = config_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)

    # Re-verify credentials if any credential field was changed
    credential_fields = {
        "ssl_store_id", "ssl_store_password",
        "stripe_publishable_key", "stripe_secret_key",
        "razorpay_key_id", "razorpay_key_secret",
    }
    if update_data.keys() & credential_fields:
        try:
            await verify_gateway_credentials(config)
        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e))
        except Exception:
            raise HTTPException(status_code=502, detail="Could not reach the payment gateway to verify credentials.")

    return await gw_repo.update(db, config)


@router.delete("/{gateway}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gateway_config(
    *,
    db: AsyncSession = Depends(get_db),
    gateway: GatewayName,
    current_user: User = Depends(get_current_user),
) -> None:
    if current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    config = await gw_repo.get_by_gateway(db, gateway)
    if not config:
        raise HTTPException(status_code=404, detail="Gateway config not found")

    await gw_repo.delete(db, config)


# ─── Public: Initiate checkout via active gateway ────────────────────────────

@router.post("/initiate/{payment_public_id}")
async def initiate_checkout(
    *,
    db: AsyncSession = Depends(get_db),
    payment_public_id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Called after a draft Payment record is created.
    Returns the gateway's hosted checkout URL.
    """
    result = await db.execute(
        select(Payment).where(Payment.public_id == payment_public_id)
    )
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.member_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your payment")
    if payment.status != PaymentStatus.PENDING:
        raise HTTPException(status_code=400, detail="Payment is already processed")

    try:
        gateway = await get_active_gateway(db)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))

    base_url = "http://localhost:3000"  # pulled from settings in production

    from app.repositories import course as course_repo
    from app.repositories import batch as batch_repo
    from app.models.payment import PaymentForType

    description = f"Payment for {payment.payment_for_type.value}"
    if payment.payment_for_type == PaymentForType.COURSE:
        course = await course_repo.get_course_by_id(db, payment.payment_for_id)
        if course:
            description = course.title[:120]
    elif payment.payment_for_type == PaymentForType.BATCH:
        batch = await batch_repo.get_batch_by_id(db, payment.payment_for_id)
        if batch:
            description = batch.name[:120]

    try:
        session = await gateway.create_checkout_session(
            payment_public_id=payment.public_id,
            amount=payment.amount,
            currency=payment.currency,
            billing_name=payment.billing_name or current_user.full_name or "Student",
            description=description,
            success_url=f"{base_url}/payments/success?ref={payment.public_id}",
            cancel_url=f"{base_url}/payments/cancel?ref={payment.public_id}",
            customer_email=current_user.email,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gateway error: {e}")

    # Persist the gateway order/session ID
    payment.order_id = session.order_id
    await db.commit()

    return {"success": True, "data": {"checkout_url": session.checkout_url, "order_id": session.order_id}}


@router.post("/payment-intent/{payment_public_id}")
async def get_payment_intent(
    *,
    db: AsyncSession = Depends(get_db),
    payment_public_id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Creates a Stripe PaymentIntent for the specified payment.
    Returns client_secret, publishable_key, and active gateway type.
    """
    result = await db.execute(
        select(Payment).where(Payment.public_id == payment_public_id)
    )
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.member_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your payment")
    if payment.status != PaymentStatus.PENDING:
        raise HTTPException(status_code=400, detail="Payment is already processed")

    try:
        gateway = await get_active_gateway(db)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))

    # Retrieve active gateway config
    config_result = await db.execute(
        select(PaymentGatewayConfig).where(PaymentGatewayConfig.is_active == True)
    )
    config = config_result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=503, detail="No active gateway config found")

    if config.gateway != GatewayName.STRIPE:
        return {
            "success": True,
            "data": {
                "gateway": config.gateway.value,
                "requires_redirect": True,
            }
        }

    from app.repositories import course as course_repo
    from app.repositories import batch as batch_repo
    from app.models.payment import PaymentForType

    description = f"Payment for {payment.payment_for_type.value}"
    if payment.payment_for_type == PaymentForType.COURSE:
        course = await course_repo.get_course_by_id(db, payment.payment_for_id)
        if course:
            description = course.title[:120]
    elif payment.payment_for_type == PaymentForType.BATCH:
        batch = await batch_repo.get_batch_by_id(db, payment.payment_for_id)
        if batch:
            description = batch.name[:120]

    try:
        intent_data = await gateway.create_payment_intent(
            payment_public_id=payment.public_id,
            amount=payment.amount,
            currency=payment.currency,
            description=description,
            customer_email=current_user.email,
        )
    except NotImplementedError:
        return {
            "success": True,
            "data": {
                "gateway": config.gateway.value,
                "requires_redirect": True,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gateway error: {e}")

    # Store the payment intent ID in payment.order_id
    payment.order_id = intent_data["payment_intent_id"]
    await db.commit()

    return {
        "success": True,
        "data": {
            "gateway": config.gateway.value,
            "requires_redirect": False,
            "client_secret": intent_data["client_secret"],
            "publishable_key": intent_data["publishable_key"],
        }
    }


# ─── Public: Webhook callbacks ───────────────────────────────────────────────

@router.post("/webhook/{gateway_name}")
async def handle_webhook(
    *,
    request: Request,
    db: AsyncSession = Depends(get_db),
    gateway_name: GatewayName,
) -> Any:
    """
    Receive and process payment callbacks from the gateway.
    On success: mark Payment as Completed and auto-enroll the student.
    """
    payload = await request.body()
    headers = dict(request.headers)

    try:
        gateway = await get_gateway_by_name(db, gateway_name)
        event = gateway.verify_webhook(payload, headers)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    order_id = event.get("order_id")
    event_status = event.get("status")

    # Find the payment by order_id
    result = await db.execute(select(Payment).where(Payment.order_id == order_id))
    payment = result.scalar_one_or_none()
    if not payment:
        # SSLCommerz sends tran_id as order_id which equals our public_id
        result = await db.execute(select(Payment).where(Payment.public_id == order_id))
        payment = result.scalar_one_or_none()

    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found for this webhook")

    if payment.status == PaymentStatus.COMPLETED:
        return {"success": True, "message": "Already processed"}

    if event_status == "success":
        payment.status = PaymentStatus.COMPLETED
        await db.commit()
        await _complete_enrollment(db, payment)
    else:
        payment.status = PaymentStatus.FAILED
        await db.commit()

    return {"success": True}


async def _complete_enrollment(db: AsyncSession, payment: Payment) -> None:
    """Auto-enroll the student after a successful payment."""
    from app.models.payment import PaymentForType
    from app.models.enrollment import Enrollment, EnrollmentStatus
    from app.models.batch import BatchEnrollment
    from app.repositories import enrollment as enrollment_repo
    from app.repositories import batch as batch_repo

    if payment.payment_for_type == PaymentForType.COURSE:
        existing = await enrollment_repo.get_enrollment_by_user_and_course(
            db, payment.member_id, payment.payment_for_id
        )
        if not existing:
            enrollment = Enrollment(
                course_id=payment.payment_for_id,
                user_id=payment.member_id,
                payment_id=payment.id,
                status=EnrollmentStatus.ACTIVE,
                is_active=True,
            )
            db.add(enrollment)
            await db.commit()

    elif payment.payment_for_type == PaymentForType.BATCH:
        existing = await batch_repo.get_enrollment(db, payment.payment_for_id, payment.member_id)
        if not existing:
            enrollment = BatchEnrollment(
                batch_id=payment.payment_for_id,
                member_id=payment.member_id,
                is_paid=True,
            )
            db.add(enrollment)
            await db.commit()
