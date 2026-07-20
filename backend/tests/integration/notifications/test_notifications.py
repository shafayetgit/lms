import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.services import notification as notification_svc

@pytest.mark.asyncio
async def test_notification_lifecycle_and_grading_trigger(client: AsyncClient, db_session: AsyncSession, test_course):
    uid = uuid.uuid4().hex[:6]
    
    # Create student and admin users
    student = User(
        username=f"student_{uid}",
        email=f"student_{uid}@example.com",
        first_name="Student",
        last_name="User",
        role="student",
        hashed_password="pw"
    )
    admin = User(
        username=f"admin_{uid}",
        email=f"admin_{uid}@example.com",
        first_name="Admin",
        last_name="User",
        role="superadmin",
        hashed_password="pw"
    )
    db_session.add(student)
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(student)
    await db_session.refresh(admin)

    from app.api.deps import get_current_active_user, get_current_user
    from app.main import app

    # Authenticate student
    app.dependency_overrides[get_current_active_user] = lambda: student
    app.dependency_overrides[get_current_user] = lambda: student

    try:
        # 1. Fetch initial empty notifications
        res_list = await client.get("/api/v1/notifications/")
        assert res_list.status_code == 200
        res_json = res_list.json()
        assert res_json["success"] is True
        assert len(res_json["data"]) == 0
        assert res_json["meta"]["total"] == 0

        # 2. Create a notification directly via service
        notif = await notification_svc.create_notification(
            db=db_session,
            user_id=student.id,
            title="Welcome to Elite",
            message="Your account is ready.",
            link="/dashboard"
        )
        assert notif.read is False

        # 3. Fetch notifications and check if it's there
        res_list = await client.get("/api/v1/notifications/")
        assert res_list.status_code == 200
        res_json = res_list.json()
        assert len(res_json["data"]) == 1
        assert res_json["data"][0]["public_id"] == notif.public_id
        assert res_json["data"][0]["read"] is False

        # 4. Mark as read
        res_read = await client.put(f"/api/v1/notifications/{notif.public_id}/read")
        assert res_read.status_code == 200
        assert res_read.json()["data"]["read"] is True

        # 5. Create another notification and mark all as read
        notif2 = await notification_svc.create_notification(
            db=db_session,
            user_id=student.id,
            title="System Alert",
            message="Maintenance tonight."
        )
        res_read_all = await client.put("/api/v1/notifications/read-all")
        assert res_read_all.status_code == 200
        
        # Verify both are read
        res_list = await client.get("/api/v1/notifications/?unread_only=true")
        assert res_list.status_code == 200
        assert len(res_list.json()["data"]) == 0

        # --- Test Grading Trigger ---
        # Authenticate admin to create assignment
        app.dependency_overrides[get_current_active_user] = lambda: admin
        app.dependency_overrides[get_current_user] = lambda: admin

        create_payload = {
            "title": f"Test Assignment {uid}",
            "type": "Text",
            "question": "Grade me",
            "show_answer": True,
            "answer": "correct",
            "grade_assignment": True,
            "course_id": test_course.id
        }
        res_create = await client.post("/api/v1/assignments/", json=create_payload)
        assert res_create.status_code == 201
        assignment_id = res_create.json()["data"]["public_id"]

        # Authenticate student to submit
        app.dependency_overrides[get_current_active_user] = lambda: student
        app.dependency_overrides[get_current_user] = lambda: student
        
        submit_payload = {"answer": "student answer"}
        res_submit = await client.post(f"/api/v1/assignments/{assignment_id}/submit", json=submit_payload)
        assert res_submit.status_code == 201
        submission_id = res_submit.json()["data"]["public_id"]

        # Authenticate admin to grade the submission
        app.dependency_overrides[get_current_active_user] = lambda: admin
        app.dependency_overrides[get_current_user] = lambda: admin

        grade_payload = {
            "status": "Accepted",
            "grade": 95.0,
            "comments": "Great work!"
        }
        res_grade = await client.put(f"/api/v1/assignments/{assignment_id}/submissions/{submission_id}", json=grade_payload)
        assert res_grade.status_code == 200

        # Authenticate back to student to verify notification
        app.dependency_overrides[get_current_active_user] = lambda: student
        app.dependency_overrides[get_current_user] = lambda: student

        res_list = await client.get("/api/v1/notifications/?unread_only=true")
        assert res_list.status_code == 200
        unread_notifs = res_list.json()["data"]
        assert len(unread_notifs) == 1
        assert unread_notifs[0]["title"] == "Assignment Graded"
        assert f"Test Assignment {uid}" in unread_notifs[0]["message"]
        assert "95.0" in unread_notifs[0]["message"]
        assert "Great work!" in unread_notifs[0]["message"]

    finally:
        # Clear dependency overrides
        app.dependency_overrides.pop(get_current_active_user, None)
        app.dependency_overrides.pop(get_current_user, None)
