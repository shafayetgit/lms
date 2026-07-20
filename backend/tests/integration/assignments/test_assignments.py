import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.assignment import Assignment, AssignmentType

@pytest.mark.asyncio
async def test_assignment_crud_lifecycle(client: AsyncClient, db_session: AsyncSession, test_course, test_lesson):
    uid = uuid.uuid4().hex[:6]
    admin = User(
        username=f"admin_{uid}",
        email=f"admin_{uid}@example.com",
        first_name="Admin",
        last_name="User",
        role="superadmin",
        hashed_password="pw"
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)

    from app.api.deps import get_current_active_user, get_current_user
    from app.main import app
    app.dependency_overrides[get_current_active_user] = lambda: admin
    app.dependency_overrides[get_current_user] = lambda: admin

    try:
        # 1. Create Assignment
        create_payload = {
            "title": f"Assignment {uid}",
            "type": "Text",
            "question": "What is 2+2?",
            "show_answer": True,
            "answer": "4",
            "grade_assignment": True,
            "course_id": test_course.id
        }
        res_create = await client.post("/api/v1/assignments/", json=create_payload)
        assert res_create.status_code == 201
        data = res_create.json()["data"]
        assert data["title"] == f"Assignment {uid}"
        public_id = data["public_id"]

        # Link assignment to the test_lesson
        test_lesson.assignment_id = data["id"]
        db_session.add(test_lesson)
        await db_session.commit()
        await db_session.refresh(test_lesson)

        # Check initial lesson progress (should be False)
        res_progress = await client.get(f"/api/v1/lesson-progress/my/lesson/{test_lesson.id}")
        assert res_progress.status_code == 200
        assert res_progress.json()["is_completed"] is False

        # 1b. List Assignments using course UUID string (public_id)
        res_list_uuid = await client.get(f"/api/v1/assignments/?course_id={test_course.public_id}")
        assert res_list_uuid.status_code == 200
        assert len(res_list_uuid.json()["data"]) >= 1

        # 1c. List Assignments using course integer ID
        res_list_int = await client.get(f"/api/v1/assignments/?course_id={test_course.id}")
        assert res_list_int.status_code == 200
        assert len(res_list_int.json()["data"]) >= 1

        # 2. Read Assignment by public_id
        res_read = await client.get(f"/api/v1/assignments/{public_id}")
        assert res_read.status_code == 200
        assert res_read.json()["data"]["public_id"] == public_id

        # 3. Submit Assignment
        submit_payload = {
            "answer": "The answer is 4."
        }
        res_submit = await client.post(f"/api/v1/assignments/{public_id}/submit", json=submit_payload)
        assert res_submit.status_code == 201
        sub_data = res_submit.json()["data"]
        assert sub_data["answer"] == "The answer is 4."
        assert sub_data["status"] == "Pending"
        sub_public_id = sub_data["public_id"]

        # Check lesson progress remains False on submission
        res_progress_sub = await client.get(f"/api/v1/lesson-progress/my/lesson/{test_lesson.id}")
        assert res_progress_sub.status_code == 200
        assert res_progress_sub.json()["is_completed"] is False

        # 3b. Resubmit Assignment when Pending (should fail)
        resubmit_payload = {
            "answer": "The answer is indeed 4."
        }
        res_resubmit_fail_pending = await client.post(f"/api/v1/assignments/{public_id}/submit", json=resubmit_payload)
        assert res_resubmit_fail_pending.status_code == 400
        assert "pending review" in res_resubmit_fail_pending.json()["message"].lower()

        # 4. List Submissions
        res_list_subs = await client.get(f"/api/v1/assignments/{public_id}/submissions")
        assert res_list_subs.status_code == 200
        subs_list = res_list_subs.json()["data"]
        assert len(subs_list) >= 1
        assert any(s["public_id"] == sub_public_id for s in subs_list)

        # 5. Grade Submission to Rejected
        grade_rejected_payload = {
            "status": "Rejected",
            "grade": 30.0,
            "comments": "Incorrect logic. Please revise."
        }
        res_grade_rejected = await client.put(f"/api/v1/assignments/{public_id}/submissions/{sub_public_id}", json=grade_rejected_payload)
        assert res_grade_rejected.status_code == 200
        graded_rejected_data = res_grade_rejected.json()["data"]
        assert graded_rejected_data["status"] == "Rejected"
        assert graded_rejected_data["grade"] == 30.0
        assert graded_rejected_data["comments"] == "Incorrect logic. Please revise."

        # Check lesson progress remains False on rejection
        res_progress_rej = await client.get(f"/api/v1/lesson-progress/my/lesson/{test_lesson.id}")
        assert res_progress_rej.status_code == 200
        assert res_progress_rej.json()["is_completed"] is False

        # 5b. Resubmit Assignment when Rejected (should succeed)
        res_resubmit = await client.post(f"/api/v1/assignments/{public_id}/submit", json=resubmit_payload)
        assert res_resubmit.status_code == 201
        resub_data = res_resubmit.json()["data"]
        assert resub_data["answer"] == "The answer is indeed 4."
        assert resub_data["status"] == "Pending"

        # Check lesson progress remains False on resubmission
        res_progress_resub = await client.get(f"/api/v1/lesson-progress/my/lesson/{test_lesson.id}")
        assert res_progress_resub.status_code == 200
        assert res_progress_resub.json()["is_completed"] is False

        # 5c. Grade Submission to Accepted
        grade_payload = {
            "status": "Accepted",
            "grade": 95.0,
            "comments": "Excellent work!"
        }
        res_grade = await client.put(f"/api/v1/assignments/{public_id}/submissions/{sub_public_id}", json=grade_payload)
        assert res_grade.status_code == 200
        graded_data = res_grade.json()["data"]
        assert graded_data["status"] == "Accepted"
        assert graded_data["grade"] == 95.0
        assert graded_data["comments"] == "Excellent work!"

        # Check lesson progress becomes True on acceptance
        res_progress_acc = await client.get(f"/api/v1/lesson-progress/my/lesson/{test_lesson.id}")
        assert res_progress_acc.status_code == 200
        assert res_progress_acc.json()["is_completed"] is True

        # 5d. Attempt to resubmit after accepted (should fail)
        resubmit_fail_payload = {
            "answer": "Trying to edit after acceptance."
        }
        res_resubmit_fail = await client.post(f"/api/v1/assignments/{public_id}/submit", json=resubmit_fail_payload)
        assert res_resubmit_fail.status_code == 400
        assert "already accepted" in res_resubmit_fail.json()["message"].lower()

        # 6. Update Assignment by public_id
        update_payload = {"title": f"Updated Assignment {uid}"}
        res_update = await client.put(f"/api/v1/assignments/{public_id}", json=update_payload)
        assert res_update.status_code == 200
        assert res_update.json()["data"]["title"] == f"Updated Assignment {uid}"

        # 7. Delete Assignment by public_id
        res_delete = await client.delete(f"/api/v1/assignments/{public_id}")
        assert res_delete.status_code == 200
        assert res_delete.json()["message"] == "Successfully deleted"

    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_assignment_show_answer_rules(client: AsyncClient, db_session: AsyncSession, test_course):
    from app.models.role import Role
    from app.models.permission import Permission
    from app.caches.permission import invalidate_permission_cache

    uid = uuid.uuid4().hex[:6]
    
    student_role = Role(name=f"Student_{uid}", slug="student")
    db_session.add(student_role)
    await db_session.flush()

    perm_read = Permission(
        role_id=student_role.id,
        resource="assignment",
        read=True,
        create=True
    )
    db_session.add(perm_read)
    await db_session.flush()
    await invalidate_permission_cache()

    student = User(
        username=f"student_{uid}",
        email=f"student_{uid}@example.com",
        first_name="Student",
        last_name="User",
        role="student",
        hashed_password="pw",
        is_active=True,
        roles=[student_role]
    )
    db_session.add(student)
    await db_session.commit()
    
    from sqlalchemy.future import select
    from sqlalchemy.orm import joinedload
    result = await db_session.execute(
        select(User).options(joinedload(User.roles)).where(User.id == student.id)
    )
    student = result.unique().scalars().first()

    from app.api.deps import get_current_active_user, get_current_user, get_optional_current_user
    from app.main import app

    try:
        # Create assignment with show_answer=False
        create_payload = {
            "title": f"Assignment {uid}",
            "type": "Text",
            "question": "What is 2+2?",
            "show_answer": False,
            "answer": "4",
            "grade_assignment": True,
            "course_id": test_course.id
        }
        
        # Override user to admin to create
        admin = User(
            username=f"admin_{uid}",
            email=f"admin_{uid}@example.com",
            first_name="Admin",
            last_name="User",
            role="superadmin",
            hashed_password="pw",
            is_active=True
        )
        db_session.add(admin)
        await db_session.commit()
        await db_session.refresh(admin)
        
        app.dependency_overrides[get_current_active_user] = lambda: admin
        app.dependency_overrides[get_current_user] = lambda: admin
        app.dependency_overrides[get_optional_current_user] = lambda: admin
        
        res_create = await client.post("/api/v1/assignments/", json=create_payload)
        assert res_create.status_code == 201
        data = res_create.json()["data"]
        public_id = data["public_id"]
        
        # 1. As student, read assignment before submitting (answer should be None)
        app.dependency_overrides[get_current_active_user] = lambda: student
        app.dependency_overrides[get_current_user] = lambda: student
        app.dependency_overrides[get_optional_current_user] = lambda: student
        
        res_read_before = await client.get(f"/api/v1/assignments/{public_id}")
        assert res_read_before.status_code == 200
        assert res_read_before.json()["data"]["answer"] is None

        # 2. Submit the assignment as student
        submit_payload = {"answer": "My response"}
        res_submit = await client.post(f"/api/v1/assignments/{public_id}/submit", json=submit_payload)
        assert res_submit.status_code == 201
        
        # 3. Read again after submit. Since show_answer=False, answer should STILL be None!
        res_read_after = await client.get(f"/api/v1/assignments/{public_id}")
        assert res_read_after.status_code == 200
        assert res_read_after.json()["data"]["answer"] is None

        # 4. Update the assignment's show_answer to True (requires admin)
        app.dependency_overrides[get_current_active_user] = lambda: admin
        app.dependency_overrides[get_current_user] = lambda: admin
        app.dependency_overrides[get_optional_current_user] = lambda: admin
        
        res_update = await client.put(f"/api/v1/assignments/{public_id}", json={"show_answer": True})
        assert res_update.status_code == 200
        
        # 5. Read again as student. Now since show_answer=True and submitted, answer should be returned!
        app.dependency_overrides[get_current_active_user] = lambda: student
        app.dependency_overrides[get_current_user] = lambda: student
        app.dependency_overrides[get_optional_current_user] = lambda: student
        
        res_read_final = await client.get(f"/api/v1/assignments/{public_id}")
        assert res_read_final.status_code == 200
        assert res_read_final.json()["data"]["answer"] == "4"

    finally:
        app.dependency_overrides.clear()


