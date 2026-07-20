import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.course import Course
from app.models.certificate import Certificate, CertificateRequest, CertificateEvaluation, RequestStatus, EvaluationStatus
from app.caches.permission import invalidate_permission_cache
from app.api.deps import (
    get_db,
    get_admin_or_instructor,
    get_current_user,
    get_current_active_user,
    get_optional_current_user,
)
from app.main import app

@pytest.mark.asyncio
async def test_certificate_permissions_flow(
    client: AsyncClient,
    db_session: AsyncSession,
    test_student,
    test_instructor,
    test_admin,
    test_course,
):
    uid = uuid.uuid4().hex[:6]
    
    # Create unique test roles to avoid mutating global/shared roles
    student_role = Role(name=f"Cert Student {uid}", slug=f"cert_student_{uid}")
    db_session.add(student_role)
    
    instructor_role = Role(name=f"Cert Instructor {uid}", slug=f"cert_instructor_{uid}")
    db_session.add(instructor_role)
    
    admin_role = Role(name=f"Cert Admin {uid}", slug=f"cert_admin_{uid}")
    db_session.add(admin_role)
    
    await db_session.flush()

    # Eager load roles to prevent lazy loading MissingGreenlet error
    res_student = await db_session.execute(
        select(User).options(joinedload(User.roles)).where(User.id == test_student.id)
    )
    test_student = res_student.unique().scalars().first()

    res_instructor = await db_session.execute(
        select(User).options(joinedload(User.roles)).where(User.id == test_instructor.id)
    )
    test_instructor = res_instructor.unique().scalars().first()

    res_admin = await db_session.execute(
        select(User).options(joinedload(User.roles)).where(User.id == test_admin.id)
    )
    test_admin = res_admin.unique().scalars().first()

    # Link test users to their roles
    test_student.roles = [student_role]
    test_instructor.roles = [instructor_role]
    test_admin.roles = [admin_role]
    db_session.add_all([test_student, test_instructor, test_admin])
    await db_session.commit()

    # Clean up any existing permissions for these specific role IDs
    await db_session.execute(
        Permission.__table__.delete().where(Permission.role_id.in_([student_role.id, instructor_role.id, admin_role.id]))
    )
    await db_session.commit()

    # Seed permissions specifically for our test roles
    student_request_perm = Permission(
        role_id=student_role.id,
        resource="certificate_request",
        read=True,
        create=False,
        only_if_creator=True
    )
    student_cert_perm = Permission(
        role_id=student_role.id,
        resource="certificate",
        read=True,
        only_if_creator=True
    )
    instructor_eval_perm = Permission(
        role_id=instructor_role.id,
        resource="evaluation",
        read=True,
        update=True,
        only_if_creator=True
    )
    admin_cert_perm = Permission(
        role_id=admin_role.id,
        resource="certificate",
        read=True,
        create=True,
        update=True,
        delete=True
    )
    admin_request_perm = Permission(
        role_id=admin_role.id,
        resource="certificate_request",
        read=True,
        create=True,
        update=True,
        delete=True
    )
    admin_eval_perm = Permission(
        role_id=admin_role.id,
        resource="evaluation",
        read=True,
        create=True,
        update=True,
        delete=True
    )
    db_session.add_all([
        student_request_perm, student_cert_perm,
        instructor_eval_perm,
        admin_cert_perm, admin_request_perm, admin_eval_perm
    ])
    await db_session.commit()
    await invalidate_permission_cache()

    # Ensure test_course has enable_certification=True
    test_course.enable_certification = True
    db_session.add(test_course)
    await db_session.commit()

    # Create a second course for the admin request test
    course2 = Course(
        title=f"Course 2 - {uuid.uuid4().hex[:6]}",
        slug=f"course-2-{uuid.uuid4().hex[:6]}",
        category_id=test_course.category_id,
        published=True,
        enable_certification=True
    )
    db_session.add(course2)
    await db_session.commit()
    await db_session.refresh(course2)

    # Helper function to switch authenticated user
    def set_auth_user(user):
        app.dependency_overrides[get_current_user] = lambda: user
        app.dependency_overrides[get_current_active_user] = lambda: user
        app.dependency_overrides[get_admin_or_instructor] = lambda: user
        app.dependency_overrides[get_optional_current_user] = lambda: user

    try:
        # --- TEST 0.1: Student requests certificate when not enrolled ---
        set_auth_user(test_student)
        not_enrolled_res = await client.post(
            "/api/v1/certificates/request",
            json={"course_public_id": test_course.public_id}
        )
        assert not_enrolled_res.status_code == 400
        assert "not enrolled" in not_enrolled_res.json()["message"].lower()

        # Enroll student but with 0% progress
        from app.models.enrollment import Enrollment, EnrollmentStatus
        enrollment = Enrollment(
            user_id=test_student.id,
            course_id=test_course.id,
            status=EnrollmentStatus.ACTIVE,
            progress=0.0
        )
        db_session.add(enrollment)
        await db_session.commit()

        # --- TEST 0.2: Student requests certificate when progress < 100 ---
        low_progress_res = await client.post(
            "/api/v1/certificates/request",
            json={"course_public_id": test_course.public_id}
        )
        assert low_progress_res.status_code == 400
        assert "progress must be 100%" in low_progress_res.json()["message"].lower()

        # Update enrollment to 100% progress
        enrollment.progress = 100.0
        enrollment.status = EnrollmentStatus.COMPLETED
        db_session.add(enrollment)
        await db_session.commit()

        # Disable certification on course to test certification enablement check
        test_course.enable_certification = False
        db_session.add(test_course)
        await db_session.commit()

        # --- TEST 0.3: Student requests certificate when certification is disabled ---
        disabled_cert_res = await client.post(
            "/api/v1/certificates/request",
            json={"course_public_id": test_course.public_id}
        )
        assert disabled_cert_res.status_code == 400
        assert "not enabled" in disabled_cert_res.json()["message"].lower()

        # Re-enable certification
        test_course.enable_certification = True
        db_session.add(test_course)
        await db_session.commit()

        # Also enroll test_student in course2 with 100% progress for the admin behalf test
        enrollment2 = Enrollment(
            user_id=test_student.id,
            course_id=course2.id,
            status=EnrollmentStatus.COMPLETED,
            progress=100.0
        )
        db_session.add(enrollment2)
        await db_session.commit()

        # --- TEST 1: Student can request a certificate for themselves ---
        set_auth_user(test_student)
        req_res = await client.post(
            "/api/v1/certificates/request",
            json={"course_public_id": test_course.public_id}
        )
        assert req_res.status_code == 201
        req_data = req_res.json()["data"]
        assert req_data["status"] == "Pending"
        request_public_id = req_data["public_id"]

        # --- TEST 2: Student trying to request for another user fails ---
        req_res_fail = await client.post(
            "/api/v1/certificates/request",
            json={"course_public_id": test_course.public_id, "member_public_id": test_instructor.public_id}
        )
        assert req_res_fail.status_code == 403
        assert "not enough permissions to request for another user" in req_res_fail.json()["message"].lower()

        # --- TEST 3: Instructor trying to request for a student fails (since instructor doesn't have certificate_request create permission) ---
        set_auth_user(test_instructor)
        req_res_inst_fail = await client.post(
            "/api/v1/certificates/request",
            json={"course_public_id": test_course.public_id, "member_public_id": test_student.public_id}
        )
        assert req_res_inst_fail.status_code == 403
        assert "not enough permissions to request for another user" in req_res_inst_fail.json()["message"].lower()

        # --- TEST 4: Instructor trying to view certificate requests list fails ---
        reqs_list_inst = await client.get("/api/v1/certificates/requests")
        assert reqs_list_inst.status_code == 403

        # --- TEST 5: Admin can request on behalf of student (using second course) ---
        set_auth_user(test_admin)
        admin_req_res = await client.post(
            "/api/v1/certificates/request",
            json={"course_public_id": course2.public_id, "member_public_id": test_student.public_id}
        )
        assert admin_req_res.status_code == 201

        # --- TEST 6: Admin can list certificate requests ---
        admin_list_res = await client.get("/api/v1/certificates/requests")
        assert admin_list_res.status_code == 200
        assert len(admin_list_res.json()["data"]) >= 2

        # --- TEST 7: Admin can approve/update certificate request ---
        approve_res = await client.put(
            f"/api/v1/certificates/requests/{request_public_id}",
            json={"status": "Approved", "evaluator_public_id": test_instructor.public_id}
        )
        assert approve_res.status_code == 200
        assert approve_res.json()["data"]["status"] == "Approved"

        # Let's verify the evaluation session is created and assigned to test_instructor
        res_eval = await db_session.execute(
            select(CertificateEvaluation).where(CertificateEvaluation.member_id == test_student.id)
        )
        evaluation = res_eval.scalars().first()
        assert evaluation is not None
        assert evaluation.evaluator_id == test_instructor.id

        # --- TEST 8: Instructor can list their assigned evaluation session ---
        set_auth_user(test_instructor)
        evals_list_inst = await client.get("/api/v1/certificates/evaluations")
        assert evals_list_inst.status_code == 200
        assert len(evals_list_inst.json()["data"]) == 1
        eval_public_id = evals_list_inst.json()["data"][0]["public_id"]

        # --- TEST 9: Another instructor cannot view or grade this evaluation session ---
        uid2 = uuid.uuid4().hex[:6]
        test_instructor2 = User(
            username=f"instructor2_{uid2}",
            email=f"instructor2_{uid2}@elite.lms",
            hashed_password="hashed_password",
            role="instructor",
            is_active=True,
            first_name="Instructor2",
            last_name="User"
        )
        db_session.add(test_instructor2)
        await db_session.commit()
        
        # Eager load roles for second instructor
        res_inst2 = await db_session.execute(
            select(User).options(joinedload(User.roles)).where(User.id == test_instructor2.id)
        )
        test_instructor2 = res_inst2.unique().scalars().first()
        test_instructor2.roles = [instructor_role]
        db_session.add(test_instructor2)
        await db_session.commit()

        set_auth_user(test_instructor2)
        evals_list_inst2 = await client.get("/api/v1/certificates/evaluations")
        assert evals_list_inst2.status_code == 200
        assert len(evals_list_inst2.json()["data"]) == 0

        eval_view_fail = await client.get(f"/api/v1/certificates/evaluations/{eval_public_id}")
        assert eval_view_fail.status_code == 403

        eval_grade_fail = await client.put(
            f"/api/v1/certificates/evaluations/{eval_public_id}",
            json={"status": "Pass", "rating": 5.0, "summary": "Great job"}
        )
        assert eval_grade_fail.status_code == 403

        # --- TEST 10: The assigned instructor can view and grade the evaluation session ---
        set_auth_user(test_instructor)
        eval_view_ok = await client.get(f"/api/v1/certificates/evaluations/{eval_public_id}")
        assert eval_view_ok.status_code == 200

        eval_grade_ok = await client.put(
            f"/api/v1/certificates/evaluations/{eval_public_id}",
            json={"status": "Pass", "rating": 5.0, "summary": "Great job"}
        )
        assert eval_grade_ok.status_code == 200
        assert eval_grade_ok.json()["data"]["status"] == "Pass"

    finally:
        app.dependency_overrides.clear()
