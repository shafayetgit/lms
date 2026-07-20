import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.session import get_session_maker
from app.models.payment import Payment, PaymentForType, PaymentStatus
from app.models.batch import BatchEnrollment, Batch, BatchCourse
from app.models.user import User
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

async def setup_test_data():
    session_maker = get_session_maker()
    async with session_maker() as session:
        # Create course associations for all three batches if not present
        res_bc = await session.execute(select(BatchCourse))
        all_bc = res_bc.scalars().all()
        if not all_bc:
            print("Creating default batch_courses links...")
            bc1 = BatchCourse(batch_id=1, course_id=1)
            bc2 = BatchCourse(batch_id=2, course_id=2)
            bc3 = BatchCourse(batch_id=3, course_id=3)
            session.add_all([bc1, bc2, bc3])
            await session.commit()
            print("Linked batches to courses successfully.")

        # Find the batch using its public_id or title
        query = select(Batch).where(Batch.title.like("%FastAPI%")).options(selectinload(Batch.courses))
        res = await session.execute(query)
        batch = res.scalars().first()
        if not batch:
            print("Batch not found")
            return None, None, None, None
        
        # Check course ID for the batch
        course_id = batch.courses[0].course_id if batch.courses else 1
        print(f"Using Batch ID: {batch.id}, Course ID: {course_id}")

        # Delete any existing enrollment to test creation
        await session.execute(delete(BatchEnrollment).where(BatchEnrollment.batch_id == batch.id, BatchEnrollment.member_id == 3))
        await session.execute(delete(Payment).where(Payment.member_id == 3))
        
        # Configure batch for checkout link test
        batch.paid_batch = True
        batch.amount = 149.99
        batch.currency = "USD"
        batch.allow_self_enrollment = True
        
        await session.commit()
        print("Cleaned up existing BatchEnrollment and Payments for user 3")

        # Create a payment for user 3 that is NOT linked to any course or batch yet
        payment = Payment(
            member_id=3,
            payment_for_type=PaymentForType.COURSE,
            payment_for_id=999,  # dummy course ID
            amount=149.99,
            original_amount=149.99,
            currency="USD",
            status=PaymentStatus.COMPLETED
        )
        session.add(payment)
        await session.commit()
        await session.refresh(payment)
        print(f"Created unlinked Payment: {payment.public_id}")
            
        res_user = await session.execute(select(User).where(User.id == 3))
        user = res_user.scalars().first()
        student_public_id = user.public_id

        return batch.public_id, payment.public_id, batch.id, student_public_id

async def run_test(batch_public_id, payment_public_id, batch_id, student_public_id):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Login as Superadmin to perform admin actions
        login_data = {
            "username": "superadminbs@yopmail.com",
            "password": "Password123!"
        }
        res = await ac.post("/api/v1/auth/token", json=login_data)
        print("Login status:", res.status_code)
        
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Call admin enroll student POST endpoint with payment_public_id
        enroll_payload = {
            "member_public_id": student_public_id,
            "is_paid": False,
            "payment_public_id": payment_public_id
        }
        res_enroll = await ac.post(f"/api/v1/batches/{batch_public_id}/enrollments", json=enroll_payload, headers=headers)
        print("Enroll status:", res_enroll.status_code)
        print("Enroll response data:", res_enroll.json())

        # 3. Call GET endpoint /api/v1/batches/{id}/enrollments
        res_get = await ac.get(f"/api/v1/batches/{batch_public_id}/enrollments", headers=headers)
        print("GET enrollments status:", res_get.status_code)
        print("GET enrollments data:", res_get.json())

        # 4. Clean up the enrollment to test user self-checkout-link
        session_maker = get_session_maker()
        async with session_maker() as session:
            await session.execute(delete(BatchEnrollment).where(BatchEnrollment.batch_id == batch_id, BatchEnrollment.member_id == 3))
            await session.execute(delete(Payment).where(Payment.member_id == 3))
            await session.commit()
            print("Cleaned up for checkout-link test")

        # 5. Login as Student (member_id = 3, which is student1@example.com)
        student_login = {
            "username": "student1@example.com",
            "password": "Password123!"
        }
        res_stud_login = await ac.post("/api/v1/auth/token", json=student_login)
        print("Student Login status:", res_stud_login.status_code)
        student_token = res_stud_login.json()["access_token"]
        student_headers = {"Authorization": f"Bearer {student_token}"}

        # 6. Test PAID Checkout Link Creation (Batch amount = 149.99)
        checkout_payload = {
            "payment_for_type": "Batch",
            "payment_for_public_id": batch_public_id,
            "billing_name": "John Doe Student",
            "source": "Web"
        }
        res_checkout = await ac.post("/api/v1/payments/checkout-link", json=checkout_payload, headers=student_headers)
        print("Paid Checkout status:", res_checkout.status_code)
        print("Paid Checkout response data:", res_checkout.json())
        assert res_checkout.status_code == 201
        assert "checkout?payment_public_id=" in res_checkout.json()["data"]["redirect_url"]

        # 7. Clean up and test FREE Checkout Link Creation (Batch amount = 0)
        async with session_maker() as session:
            await session.execute(delete(BatchEnrollment).where(BatchEnrollment.batch_id == batch_id, BatchEnrollment.member_id == 3))
            await session.execute(delete(Payment).where(Payment.member_id == 3))
            # Set batch as free
            query = select(Batch).where(Batch.id == batch_id)
            res_b = await session.execute(query)
            b = res_b.scalar_one()
            b.paid_batch = False
            b.amount = 0.0
            await session.commit()
            print("Set batch to Free for checkout link test")

        res_free_checkout = await ac.post("/api/v1/payments/checkout-link", json=checkout_payload, headers=student_headers)
        print("Free Checkout status:", res_free_checkout.status_code)
        print("Free Checkout response data:", res_free_checkout.json())
        assert res_free_checkout.status_code == 201
        # Should redirect directly to batch dashboard
        assert f"/lms/batches/{batch_public_id}/dashboard" in res_free_checkout.json()["data"]["redirect_url"]
        
        # Verify enrollment is created automatically
        async with session_maker() as session:
            res_enr = await session.execute(select(BatchEnrollment).where(BatchEnrollment.batch_id == batch_id, BatchEnrollment.member_id == 3))
            enr = res_enr.scalars().first()
            assert enr is not None
            print("Free Checkout enrollment verified successfully!")

async def main():
    batch_public_id, payment_public_id, batch_id, student_public_id = await setup_test_data()
    if batch_public_id:
        await run_test(batch_public_id, payment_public_id, batch_id, student_public_id)

if __name__ == "__main__":
    asyncio.run(main())
