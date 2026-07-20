import enum
from datetime import date
from typing import Optional, TYPE_CHECKING
from sqlalchemy import (
    Boolean,
    Enum as SQLEnum,
    Float,
    ForeignKey,
    String,
    Date,
    Integer,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User

class CouponType(str, enum.Enum):
    PERCENT = "Percent"
    AMOUNT = "Amount"

class PaymentForType(str, enum.Enum):
    COURSE = "Course"
    BATCH = "Batch"
    PROGRAM = "Program"

class PaymentStatus(str, enum.Enum):
    PENDING = "Pending"
    COMPLETED = "Completed"
    FAILED = "Failed"
    REFUNDED = "Refunded"

class Coupon(Base):
    __tablename__ = "coupons"

    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    type: Mapped[CouponType] = mapped_column(
        SQLEnum(
            CouponType,
            name="coupon_type_enum",
            values_callable=lambda x: [e.value for e in x],
        )
    )
    discount: Mapped[float] = mapped_column(Float)
    validity: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    max_uses: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    used_count: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    payments: Mapped[list["Payment"]] = relationship("Payment", back_populates="coupon")
    applicable_items: Mapped[list["CouponItem"]] = relationship(
        "CouponItem", back_populates="coupon", cascade="all, delete-orphan", lazy="selectin"
    )

class CouponItem(Base):
    __tablename__ = "coupon_items"

    coupon_id: Mapped[int] = mapped_column(
        ForeignKey("coupons.id", ondelete="CASCADE"), index=True
    )
    reference_type: Mapped[PaymentForType] = mapped_column(
        SQLEnum(
            PaymentForType,
            name="payment_for_type_enum",
            values_callable=lambda x: [e.value for e in x],
        )
    )
    reference_id: Mapped[int] = mapped_column(Integer)

    # Relationships
    coupon: Mapped["Coupon"] = relationship("Coupon", back_populates="applicable_items")

class Payment(Base):
    __tablename__ = "payments"

    member_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    billing_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    payment_for_type: Mapped[PaymentForType] = mapped_column(
        SQLEnum(
            PaymentForType,
            name="payment_for_type_enum",
            values_callable=lambda x: [e.value for e in x],
        )
    )
    payment_for_id: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(10), default="USD")
    amount: Mapped[float] = mapped_column(Float)
    original_amount: Mapped[float] = mapped_column(Float)
    discount_amount: Mapped[float] = mapped_column(Float, default=0.0)
    coupon_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("coupons.id", ondelete="SET NULL"), nullable=True
    )
    payment_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    order_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    source: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    status: Mapped[PaymentStatus] = mapped_column(
        SQLEnum(
            PaymentStatus,
            name="payment_status_enum",
            values_callable=lambda x: [e.value for e in x],
        ),
        default=PaymentStatus.PENDING,
    )

    # Billing Address Details
    billing_address_line_1: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    billing_address_line_2: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    billing_city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    billing_state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    billing_country: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    billing_postal_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    billing_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    where_heard: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    consent_invoicing: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    member: Mapped["User"] = relationship("User", foreign_keys=[member_id], back_populates="payments")
    coupon: Mapped[Optional["Coupon"]] = relationship("Coupon", back_populates="payments")

    @property
    def member_email(self) -> Optional[str]:
        return self.member.email if self.member else None

    @property
    def coupon_code(self) -> Optional[str]:
        return self.coupon.code if self.coupon else None
