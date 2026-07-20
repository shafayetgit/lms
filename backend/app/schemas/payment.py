from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.payment import CouponType, PaymentForType, PaymentStatus

# ---------------- COUPON ITEMS ---------------- #

class CouponItemBase(BaseModel):
    reference_type: PaymentForType
    reference_id: int

class CouponItemCreate(CouponItemBase):
    pass

class CouponItemResponse(CouponItemBase):
    id: int
    coupon_id: int

    model_config = ConfigDict(from_attributes=True)


# ---------------- COUPONS ---------------- #

class CouponBase(BaseModel):
    code: str
    type: CouponType
    discount: float
    validity: Optional[date] = None
    max_uses: Optional[int] = None
    is_active: bool = True

class CouponCreate(CouponBase):
    applicable_items: Optional[list[CouponItemCreate]] = None

class CouponUpdate(BaseModel):
    code: Optional[str] = None
    type: Optional[CouponType] = None
    discount: Optional[float] = None
    validity: Optional[date] = None
    max_uses: Optional[int] = None
    is_active: Optional[bool] = None
    applicable_items: Optional[list[CouponItemCreate]] = None

class CouponResponse(CouponBase):
    id: int
    public_id: str
    used_count: int
    applicable_items: list[CouponItemResponse] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------- PAYMENTS ---------------- #

class PaymentBase(BaseModel):
    member_id: int
    billing_name: Optional[str] = None
    payment_for_type: PaymentForType
    payment_for_id: int
    currency: str = "USD"
    amount: float
    original_amount: float
    discount_amount: float = 0.0
    coupon_id: Optional[int] = None
    payment_id: Optional[str] = None
    order_id: Optional[str] = None
    source: Optional[str] = None
    status: PaymentStatus = PaymentStatus.PENDING
    billing_address_line_1: Optional[str] = None
    billing_address_line_2: Optional[str] = None
    billing_city: Optional[str] = None
    billing_state: Optional[str] = None
    billing_country: Optional[str] = None
    billing_postal_code: Optional[str] = None
    billing_phone: Optional[str] = None
    where_heard: Optional[str] = None
    consent_invoicing: bool = False

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    status: Optional[PaymentStatus] = None
    payment_id: Optional[str] = None

class PaymentMember(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class PaymentResponse(PaymentBase):
    id: int
    public_id: str
    item_details: Optional[dict] = None
    member: Optional[PaymentMember] = None
    member_email: Optional[str] = None
    coupon_code: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------- UTILITIES ---------------- #

class ApplyCouponRequest(BaseModel):
    code: str
    amount: float
    payment_for_type: Optional[PaymentForType] = None
    payment_for_id: Optional[int] = None

class ApplyCouponResponse(BaseModel):
    discount_amount: float
    final_amount: float
    coupon_id: int


# ---------------- CHECKOUT ---------------- #

class CheckoutLinkRequest(BaseModel):
    payment_for_type: PaymentForType
    payment_for_public_id: str
    billing_name: str
    billing_address_line_1: str
    billing_address_line_2: Optional[str] = None
    billing_city: str
    billing_state: Optional[str] = None
    billing_country: str
    billing_postal_code: Optional[str] = None
    billing_phone: Optional[str] = None
    where_heard: str
    consent_invoicing: bool = False
    coupon_code: Optional[str] = None
    payment_for_certificate: bool = False
    source: Optional[str] = "Web"

class CheckoutLinkResponse(BaseModel):
    redirect_url: str
    payment: PaymentResponse

