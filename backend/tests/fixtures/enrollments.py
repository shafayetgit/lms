import pytest_asyncio
import uuid
from app.models.enrollment import Enrollment, EnrollmentStatus
from faker import Faker

fake = Faker()

@pytest_asyncio.fixture
async def test_enrollment(db_session, test_student, test_course):
    """Create an enrollment linking a student to a course."""
    enrollment = Enrollment(
        user_id=test_student.id,
        course_id=test_course.id,
        status=EnrollmentStatus.ACTIVE,
        payment_id=None
    )
    db_session.add(enrollment)
    await db_session.commit()
    await db_session.refresh(enrollment)
    return enrollment
