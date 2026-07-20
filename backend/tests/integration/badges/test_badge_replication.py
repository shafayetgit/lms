import pytest
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.category import Category
from app.models.course import Course
from app.models.chapter import Chapter
from app.models.lesson import Lesson
from app.models.badge import Badge, BadgeAssignment
from app.models.course_progress import CourseProgress
from app.models.certificate import Certificate
from app.services.badge import safe_eval, process_badges
from app.repositories import badge as badge_repo
from datetime import date

@pytest.mark.asyncio
async def test_safe_eval_parser():
    class DummyDoc:
        def __init__(self, score, status, is_completed):
            self.score = score
            self.status = status
            self.is_completed = is_completed

    doc = DummyDoc(score=85, status="Approved", is_completed=True)
    context = {
        "doc": doc,
        "resource": doc,
        "resourse": doc
    }

    assert safe_eval("doc.score >= 80", context) is True
    assert safe_eval("resource.score >= 80", context) is True
    assert safe_eval("resourse.score >= 80", context) is True
    assert safe_eval("doc.status == 'Approved'", context) is True
    assert safe_eval("resource.status == 'Approved'", context) is True
    assert safe_eval("doc.is_completed == True", context) is True
    assert safe_eval("resource.is_completed == True", context) is True
    assert safe_eval("resourse.is_completed == True", context) is True
    assert safe_eval("doc.score > 80 and doc.status == 'Approved'", context) is True

    assert safe_eval("doc.score < 80", context) is False
    assert safe_eval("resource.score < 80", context) is False
    assert safe_eval("doc.status == 'Rejected'", context) is False
    assert safe_eval("doc.score > 90 or doc.is_completed == False", context) is False
    assert safe_eval("resource.score > 90 or resource.is_completed == False", context) is False

    assert safe_eval("__import__('os').system('echo hack')", context) is False
    assert safe_eval("eval('1+1')", context) is False


@pytest.mark.asyncio
async def test_automatic_badge_assignment_on_course_progress(db_session: AsyncSession):
    # 1. Create dependencies to respect FKs
    category = Category(name=f"Cat-{uuid.uuid4().hex[:6]}", slug=f"cat-{uuid.uuid4().hex[:6]}")
    instructor = User(
        username=f"ins_{uuid.uuid4().hex[:6]}",
        email=f"ins_{uuid.uuid4().hex[:6]}@example.com",
        hashed_password="hashed",
        role="instructor",
        is_active=True,
        first_name="I", last_name="N"
    )
    db_session.add(category)
    db_session.add(instructor)
    await db_session.commit()

    course = Course(
        title=f"Course-{uuid.uuid4().hex[:6]}",
        slug=f"course-{uuid.uuid4().hex[:6]}",
        instructors=[instructor],
        category_id=category.id
    )
    db_session.add(course)
    await db_session.commit()

    chapter = Chapter(course_id=course.id, title="Ch1", order_index=1)
    db_session.add(chapter)
    await db_session.commit()

    lesson = Lesson(
        chapter_id=chapter.id,
        course_id=course.id,
        title="L1",
        slug=f"l1-{uuid.uuid4().hex[:6]}",
        lesson_type="content",
        order_index=1,
        content="Test"
    )
    db_session.add(lesson)
    await db_session.commit()

    member = User(
        username=f"test_student_{uuid.uuid4().hex[:6]}",
        email=f"test_{uuid.uuid4().hex[:6]}@example.com",
        hashed_password="hashed",
        role="student",
        is_active=True,
        first_name="Badge",
        last_name="Test"
    )
    db_session.add(member)
    await db_session.commit()

    # 2. Configure a dynamic Badge (watching course_progress for completion)
    badge = Badge(
        title=f"Python Master_{uuid.uuid4().hex[:6]}",
        description="Completed Python progress",
        is_active=True,
        reference_table="course_progress",
        event="Value Change",
        user_field="user_id",
        field_to_check="is_completed",
        condition="resource.is_completed == True",
        grant_only_once=True
    )
    db_session.add(badge)
    await db_session.commit()

    # 3. Simulate Course Progress mutation
    progress = CourseProgress(
        user_id=member.id,
        lesson_id=lesson.id,
        course_id=course.id,
        current_time=120,
        is_completed=False
    )
    db_session.add(progress)
    await db_session.commit()

    # Trigger process_badges with false condition (should NOT assign badge)
    await process_badges(db_session, progress, event="Value Change")
    
    assignments = await badge_repo.get_assignments(db_session, member_id=member.id)
    assert len(assignments) == 0

    # Mutate to completed (is_completed = True)
    progress.is_completed = True
    await process_badges(db_session, progress, event="Value Change")

    assignments = await badge_repo.get_assignments(db_session, member_id=member.id)
    assert len(assignments) == 1
    assert assignments[0].badge_id == badge.id

    # Verify notification was generated for the member
    from app.services import notification as notification_svc
    notifs = await notification_svc.get_notifications_for_user(db_session, user_id=member.id)
    assert len(notifs) == 1
    assert "New Badge Awarded" in notifs[0].title
    assert badge.title in notifs[0].message
    assert notifs[0].link == "/academy/badges"


@pytest.mark.asyncio
async def test_automatic_badge_assignment_on_certificate(db_session: AsyncSession):
    # 1. Create dependencies
    category = Category(name=f"Cat-{uuid.uuid4().hex[:6]}", slug=f"cat-{uuid.uuid4().hex[:6]}")
    instructor = User(
        username=f"ins_{uuid.uuid4().hex[:6]}",
        email=f"ins_{uuid.uuid4().hex[:6]}@example.com",
        hashed_password="hashed",
        role="instructor",
        is_active=True,
        first_name="I", last_name="N"
    )
    db_session.add(category)
    db_session.add(instructor)
    await db_session.commit()

    course = Course(
        title=f"Course-{uuid.uuid4().hex[:6]}",
        slug=f"course-{uuid.uuid4().hex[:6]}",
        instructors=[instructor],
        category_id=category.id
    )
    db_session.add(course)
    await db_session.commit()

    member = User(
        username=f"test_student_{uuid.uuid4().hex[:6]}",
        email=f"test_{uuid.uuid4().hex[:6]}@example.com",
        hashed_password="hashed",
        role="student",
        is_active=True,
        first_name="Cert",
        last_name="Badge"
    )
    db_session.add(member)
    await db_session.commit()

    # 2. Configure a dynamic Badge (watching certificates table for creation)
    badge = Badge(
        title=f"Graduate Badge_{uuid.uuid4().hex[:6]}",
        description="Completed course certified",
        is_active=True,
        reference_table="certificates",
        event="New",
        user_field="member_id",
        condition="resource.published == True",
        grant_only_once=True
    )
    db_session.add(badge)
    await db_session.commit()

    # 3. Create a Certificate (triggering New event)
    cert = Certificate(
        member_id=member.id,
        course_id=course.id,
        issue_date=date.today(),
        published=True
    )
    db_session.add(cert)
    await db_session.commit()

    # Trigger process_badges for creation
    await process_badges(db_session, cert, event="New")

    assignments = await badge_repo.get_assignments(db_session, member_id=member.id)
    assert len(assignments) == 1
    assert assignments[0].badge_id == badge.id

    # Verify notification was generated for the member
    from app.services import notification as notification_svc
    notifs = await notification_svc.get_notifications_for_user(db_session, user_id=member.id)
    assert len(notifs) == 1
    assert "New Badge Awarded" in notifs[0].title
    assert badge.title in notifs[0].message
    assert notifs[0].link == "/academy/badges"


@pytest.mark.asyncio
async def test_badge_assignment_endpoints(client, db_session: AsyncSession):
    from httpx import AsyncClient
    # 1. Create a member
    member = User(
        username=f"student_{uuid.uuid4().hex[:6]}",
        email=f"student_{uuid.uuid4().hex[:6]}@example.com",
        hashed_password="hashed",
        role="student",
        is_active=True,
        first_name="Alice",
        last_name="Smith"
    )
    # 2. Create a badge
    badge = Badge(
        title=f"Manual Badge_{uuid.uuid4().hex[:6]}",
        description="Manual assignment test",
        is_active=True,
        grant_only_once=True
    )
    db_session.add(member)
    db_session.add(badge)
    await db_session.commit()

    # 3. Test Assign endpoint using public IDs
    response = await client.post(
        "/api/v1/badges/assign",
        json={
            "badge_public_id": badge.public_id,
            "member_public_id": member.public_id
        }
    )
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["badge_id"] == badge.id
    assert data["member_id"] == member.id
    assert "public_id" in data
    assert data["member"]["public_id"] == member.public_id
    assert data["badge"]["public_id"] == badge.public_id

    # Verify notification was generated for the member
    from app.services import notification as notification_svc
    notifs = await notification_svc.get_notifications_for_user(db_session, user_id=member.id)
    assert len(notifs) == 1
    assert "New Badge Awarded" in notifs[0].title
    assert badge.title in notifs[0].message

    # 4. Test list assignments endpoint with public ID filtering
    list_response = await client.get(
        "/api/v1/badges/assignments",
        params={
            "badge_public_id": badge.public_id,
            "member_public_id": member.public_id
        }
    )
    assert list_response.status_code == 200
    list_data = list_response.json()["data"]
    assert len(list_data) == 1
    assert list_data[0]["public_id"] == data["public_id"]

    # 5. Test Revoke endpoint
    revoke_response = await client.delete(f"/api/v1/badges/assignments/{data['public_id']}")
    assert revoke_response.status_code == 200
    assert revoke_response.json() == {
        "success": True,
        "message": "Successfully deleted"
    }
