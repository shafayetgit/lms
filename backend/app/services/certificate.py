from datetime import date
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.models.certificate import (
    Certificate,
    CertificateEvaluation,
    CertificateRequest,
    EvaluationStatus,
    RequestStatus,
)
from app.schemas.certificate import (
    CertificateCreate,
    CertificateUpdate,
    CertificateEvaluationCreate,
    CertificateEvaluationUpdate,
    CertificateRequestCreate,
    CertificateRequestUpdate,
)
from app.repositories import certificate as cert_repo
from app.repositories import course as course_repo
from app.repositories import batch as batch_repo

# ---------------- CERTIFICATES ---------------- #

async def issue_certificate(db: AsyncSession, cert_in: CertificateCreate) -> Certificate:
    from app.repositories.user import get_user_by_public_id
    member = await get_user_by_public_id(db, cert_in.member_public_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    course_id = None
    if cert_in.course_public_id:
        course = await course_repo.get_course_by_public_id(db, cert_in.course_public_id)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        course_id = course.id
            
    batch_id = None
    if cert_in.batch_public_id:
        batch = await batch_repo.get_batch_by_id(db, cert_in.batch_public_id)
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
        batch_id = batch.id

    # Basic duplicate check
    existing = await cert_repo.get_certificates(
        db, member_id=member.id, course_id=course_id
    )
    if existing:
        raise HTTPException(status_code=400, detail="Certificate already issued for this course")

    cert = Certificate(
        member_id=member.id,
        course_id=course_id,
        batch_id=batch_id,
        issue_date=cert_in.issue_date,
        expiry_date=cert_in.expiry_date,
        published=cert_in.published,
        template=cert_in.template
    )
    created_cert = await cert_repo.create_certificate(db, cert)
    from app.services.badge import process_badges
    await process_badges(db, created_cert, event="New")
    return created_cert

async def update_certificate(
    db: AsyncSession, cert: Certificate, cert_in: CertificateUpdate
) -> Certificate:
    update_data = cert_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cert, field, value)
    from app.services.badge import process_badges
    await process_badges(db, cert, event="Value Change")
    updated_cert = await cert_repo.update_certificate(db, cert)
    return updated_cert


# ---------------- REQUESTS ---------------- #

async def request_certificate(
    db: AsyncSession, user_id: int, request_in: CertificateRequestCreate
) -> CertificateRequest:
    if not request_in.course_public_id and not request_in.batch_public_id:
        raise HTTPException(status_code=400, detail="Must provide course_public_id or batch_public_id")

    course_id = None
    if request_in.course_public_id:
        course = await course_repo.get_course_by_public_id(db, request_in.course_public_id)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        course_id = course.id

        if not course.enable_certification:
            raise HTTPException(
                status_code=400,
                detail="Certification is not enabled for this course"
            )

        from app.models.enrollment import Enrollment
        from sqlalchemy import select
        stmt = select(Enrollment).where(
            Enrollment.user_id == user_id,
            Enrollment.course_id == course_id
        )
        res = await db.execute(stmt)
        enrollment = res.scalars().first()
        if not enrollment:
            raise HTTPException(
                status_code=400,
                detail="Student is not enrolled in this course"
            )
        if enrollment.progress < 100.0:
            raise HTTPException(
                status_code=400,
                detail="Course progress must be 100% to request a certificate"
            )

    batch_id = None
    if request_in.batch_public_id:
        batch = await batch_repo.get_batch_by_id(db, request_in.batch_public_id)
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
        batch_id = batch.id

    if course_id:
        existing = await cert_repo.get_request_by_member_and_course(db, user_id, course_id)
        if existing and existing.status in [RequestStatus.PENDING, RequestStatus.APPROVED]:
            raise HTTPException(status_code=400, detail="Certificate request already exists")

    # Set evaluator automatically (as in Frappe LMS)
    evaluator_id = None
    if batch_id and course_id:
        from app.models.batch import BatchCourse
        from sqlalchemy import select
        stmt = select(BatchCourse).where(BatchCourse.batch_id == batch_id, BatchCourse.course_id == course_id)
        res = await db.execute(stmt)
        bc = res.scalar_one_or_none()
        if bc and bc.evaluator_id:
            evaluator_id = bc.evaluator_id
    
    if not evaluator_id and course_id:
        course = await course_repo.get_course_by_public_id(db, request_in.course_public_id)
        if course and course.instructors:
            evaluator_id = course.instructors[0].id

    req = CertificateRequest(
        member_id=user_id,
        course_id=course_id,
        batch_id=batch_id,
        evaluator_id=evaluator_id,
        status=RequestStatus.PENDING
    )
    return await cert_repo.create_request(db, req)

async def approve_request(
    db: AsyncSession, request: CertificateRequest, update_in: CertificateRequestUpdate
) -> CertificateRequest:
    if update_in.status:
        request.status = update_in.status
        
    if update_in.evaluator_public_id:
        from app.repositories.user import get_user_by_public_id
        evaluator = await get_user_by_public_id(db, update_in.evaluator_public_id)
        if not evaluator:
            raise HTTPException(status_code=404, detail="Evaluator not found")
        request.evaluator_id = evaluator.id
        
    # If evaluator assigned and approved, create an evaluation session
    if request.status == RequestStatus.APPROVED and request.evaluator_id:
        from sqlalchemy import select
        from app.models.certificate import CertificateEvaluation
        stmt = select(CertificateEvaluation).where(
            CertificateEvaluation.member_id == request.member_id,
            CertificateEvaluation.course_id == request.course_id,
            CertificateEvaluation.batch_id == request.batch_id
        )
        res = await db.execute(stmt)
        existing_eval = res.scalar_one_or_none()
        if not existing_eval:
            eval_session = CertificateEvaluation(
                member_id=request.member_id,
                course_id=request.course_id,
                batch_id=request.batch_id,
                evaluator_id=request.evaluator_id,
                status=EvaluationStatus.PENDING
            )
            created_eval = await cert_repo.create_evaluation(db, eval_session)

            # Notify the student their request was approved and evaluation is scheduled
            try:
                from app.services.notification import create_notification
                from app.repositories import course as course_repo_local
                course_title = request.course.title if request.course else (request.batch.title if request.batch else "N/A")
                await create_notification(
                    db=db,
                    user_id=request.member_id,
                    title="Certificate Request Approved ✅",
                    message=f"Your certificate request for '{course_title}' has been approved. An evaluation session has been scheduled for you.",
                    link=f"/academy/courses/{request.course.slug}" if request.course else None
                )
            except Exception as e:
                print(f"Error notifying student of evaluation creation: {e}")

    return await cert_repo.update_request(db, request)


# ---------------- EVALUATIONS ---------------- #

async def create_evaluation_session(
    db: AsyncSession, eval_in: CertificateEvaluationCreate
) -> CertificateEvaluation:
    from app.repositories.user import get_user_by_public_id
    member = await get_user_by_public_id(db, eval_in.member_public_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    course_id = None
    if eval_in.course_public_id:
        course = await course_repo.get_course_by_public_id(db, eval_in.course_public_id)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        course_id = course.id

    batch_id = None
    if eval_in.batch_public_id:
        batch = await batch_repo.get_batch_by_id(db, eval_in.batch_public_id)
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
        batch_id = batch.id

    evaluator_id = None
    if eval_in.evaluator_public_id:
        evaluator = await get_user_by_public_id(db, eval_in.evaluator_public_id)
        if not evaluator:
            raise HTTPException(status_code=404, detail="Evaluator not found")
        evaluator_id = evaluator.id

    evaluation = CertificateEvaluation(
        member_id=member.id,
        course_id=course_id,
        batch_id=batch_id,
        evaluator_id=evaluator_id,
        date=eval_in.date,
        start_time=eval_in.start_time,
        end_time=eval_in.end_time,
        status=EvaluationStatus.PENDING
    )
    created_eval = await cert_repo.create_evaluation(db, evaluation)

    # Notify the student an evaluation session was manually created for them
    try:
        from app.services.notification import create_notification
        course_title = course.title if eval_in.course_public_id and course_id else (batch.title if eval_in.batch_public_id and batch_id else "N/A")
        await create_notification(
            db=db,
            user_id=member.id,
            title="Evaluation Session Scheduled 📅",
            message=f"An evaluation session has been scheduled for your certificate on '{course_title}'.",
            link=None
        )
    except Exception as e:
        print(f"Error notifying student of manual evaluation creation: {e}")

    return created_eval

async def complete_evaluation(
    db: AsyncSession, evaluation: CertificateEvaluation, update_in: CertificateEvaluationUpdate
) -> CertificateEvaluation:
    update_data = update_in.model_dump(exclude_unset=True)

    # Handle evaluator separately (needs public_id lookup)
    evaluator_public_id = update_data.pop("evaluator_public_id", None)
    if evaluator_public_id:
        from app.repositories.user import get_user_by_public_id
        evaluator = await get_user_by_public_id(db, evaluator_public_id)
        if not evaluator:
            raise HTTPException(status_code=404, detail="Evaluator not found")
        evaluation.evaluator_id = evaluator.id

    for field, value in update_data.items():
        setattr(evaluation, field, value)

    # Auto-issue certificate on pass
    if update_in.status == EvaluationStatus.PASS:
        existing_cert = await cert_repo.get_certificates(
            db, member_id=evaluation.member_id, course_id=evaluation.course_id
        )
        if not existing_cert:
            new_cert = Certificate(
                member_id=evaluation.member_id,
                course_id=evaluation.course_id,
                batch_id=evaluation.batch_id,
                issue_date=date.today(),
                published=True
            )
            created_cert = await cert_repo.create_certificate(db, new_cert)
            from app.services.badge import process_badges
            await process_badges(db, created_cert, event="New")

    updated = await cert_repo.update_evaluation(db, evaluation)

    # Notify student of pass or fail outcome
    try:
        from app.services.notification import create_notification
        course_title = evaluation.course.title if evaluation.course else (evaluation.batch.title if evaluation.batch else "N/A")
        if update_in.status == EvaluationStatus.PASS:
            await create_notification(
                db=db,
                user_id=evaluation.member_id,
                title="🎉 Certificate Issued!",
                message=f"Congratulations! You passed your evaluation for '{course_title}'. Your certificate has been issued and is ready.",
                link="/academy/my-certificates" if not evaluation.course else f"/academy/courses/{evaluation.course.slug}"
            )
        elif update_in.status == EvaluationStatus.FAIL:
            await create_notification(
                db=db,
                user_id=evaluation.member_id,
                title="Evaluation Result",
                message=f"Unfortunately, you did not pass your evaluation for '{course_title}'. You may re-request once you feel ready.",
                link=f"/academy/courses/{evaluation.course.slug}" if evaluation.course else None
            )
    except Exception as e:
        print(f"Error notifying student of evaluation result: {e}")

    return updated
