from typing import Any, Optional
import math
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import PermissionChecker, get_current_user
from app.models.user import User
from app.schemas.certificate import (
    CertificateCreate,
    CertificateUpdate,
    CertificateResponse,
    CertificateEvaluationCreate,
    CertificateEvaluationUpdate,
    CertificateEvaluationResponse,
    CertificateRequestCreate,
    CertificateRequestUpdate,
    CertificateRequestResponse,
)
from app.repositories import certificate as cert_repo
from app.services import certificate as cert_svc
from app.core.responses import read_response, create_response, update_response, delete_response

router = APIRouter()

# ---------------- CERTIFICATES ---------------- #

@router.post("/", status_code=status.HTTP_201_CREATED)
async def issue_certificate(
    *,
    db: AsyncSession = Depends(get_db),
    cert_in: CertificateCreate,
    current_user: User = Depends(PermissionChecker("certificate", "create"))
) -> Any:
    cert = await cert_svc.issue_certificate(db, cert_in=cert_in)
    return create_response(CertificateResponse.model_validate(cert).model_dump(by_alias=False))

@router.get("/")
async def read_certificates(
    db: AsyncSession = Depends(get_db),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    member_id: Optional[int] = None,
    course_id: Optional[int] = None,
    current_user: User = Depends(get_current_user)
) -> Any:
    from app.core.dependencies import has_permission
    if not await has_permission(current_user, db, "certificate", "read"):
        member_id = current_user.id
        
    total = await cert_repo.count_certificates(db, member_id=member_id, course_id=course_id)
    skip = (page - 1) * size
    certs = await cert_repo.get_certificates(db, skip=skip, limit=size, member_id=member_id, course_id=course_id)
    
    total_pages = math.ceil(total / size) if total else 0
    data = {
        "data": [CertificateResponse.model_validate(c).model_dump(by_alias=False) for c in certs],
        "meta": {
            "total": total,
            "page": page,
            "size": size,
            "pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }
    }
    return read_response(data)


# ---------------- REQUESTS ---------------- #

@router.post("/request", status_code=status.HTTP_201_CREATED)
async def create_certificate_request(
    *,
    db: AsyncSession = Depends(get_db),
    request_in: CertificateRequestCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    target_user_id = current_user.id
    if request_in.member_public_id:
        from app.core.dependencies import has_permission
        if not await has_permission(current_user, db, "certificate_request", "create"):
            raise HTTPException(status_code=403, detail="Not enough permissions to request for another user")
        from app.repositories.user import get_user_by_public_id
        member = await get_user_by_public_id(db, request_in.member_public_id)
        if not member:
            raise HTTPException(status_code=404, detail="Student not found")
        target_user_id = member.id
    req = await cert_svc.request_certificate(db, user_id=target_user_id, request_in=request_in)

    # Notify admins/superadmins of the new certificate request
    try:
        from sqlalchemy import select
        from app.services.notification import create_notification
        
        # Compile recipient user IDs: assigned evaluator and all active admins/superadmins
        recipient_ids = set()
        if req.evaluator_id:
            recipient_ids.add(req.evaluator_id)

        from app.models.role import Role
        
        # Query active admin/superadmin users
        stmt = select(User).join(User.roles).where(
            User.is_active == True,
            Role.slug.in_(["admin", "superadmin", "super-admin"])
        )
        res_admins = await db.execute(stmt)
        for admin in res_admins.scalars().all():
            recipient_ids.add(admin.id)
        
        student_name = req.member.full_name or req.member.email or "A student"
        course_or_batch = req.course.title if req.course else (req.batch.title if req.batch else "N/A")
        message = f"{student_name} has requested a certificate for '{course_or_batch}'."
        
        for r_id in recipient_ids:
            await create_notification(
                db=db,
                user_id=r_id,
                title="New Certificate Request",
                message=message,
                link=f"/lms/certificate-requests/{req.public_id}"
            )
    except Exception as e:
        # Avoid failing the certificate request if notification fails
        print(f"Error creating admin notification for certificate request: {e}")

    return create_response(CertificateRequestResponse.model_validate(req).model_dump(by_alias=False))

@router.get("/requests")
async def read_certificate_requests(
    db: AsyncSession = Depends(get_db),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    status_filter: Optional[str] = None,
    current_user: User = Depends(PermissionChecker("certificate_request", "read"))
) -> Any:
    member_id = current_user.id if getattr(current_user, "_requires_creator_check", False) else None
    total = await cert_repo.count_requests(db, member_id=member_id, status=status_filter)
    skip = (page - 1) * size
    reqs = await cert_repo.get_requests(db, skip=skip, limit=size, member_id=member_id, status=status_filter)
    
    total_pages = math.ceil(total / size) if total else 0
    data = {
        "data": [CertificateRequestResponse.model_validate(r).model_dump(by_alias=False) for r in reqs],
        "meta": {
            "total": total,
            "page": page,
            "size": size,
            "pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }
    }
    return read_response(data)

@router.get("/requests/{id}")
async def read_certificate_request(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    current_user: User = Depends(PermissionChecker("certificate_request", "read"))
) -> Any:
    req = await cert_repo.get_request_by_id(db, id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if getattr(current_user, "_requires_creator_check", False) and req.member_id != current_user.id:
        raise HTTPException(status_code=403, detail="The user doesn't have enough privileges")
    return read_response({"data": CertificateRequestResponse.model_validate(req).model_dump(by_alias=False)})

@router.put("/requests/{id}")
async def update_certificate_request(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    update_in: CertificateRequestUpdate,
    current_user: User = Depends(PermissionChecker("certificate_request", "update"))
) -> Any:
    req = await cert_repo.get_request_by_id(db, id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    updated_req = await cert_svc.approve_request(db, request=req, update_in=update_in)
    return update_response(CertificateRequestResponse.model_validate(updated_req).model_dump(by_alias=False))


# ---------------- EVALUATIONS ---------------- #

@router.post("/evaluations", status_code=status.HTTP_201_CREATED)
async def create_evaluation_session(
    *,
    db: AsyncSession = Depends(get_db),
    eval_in: CertificateEvaluationCreate,
    current_user: User = Depends(PermissionChecker("evaluation", "create"))
) -> Any:
    eval_session = await cert_svc.create_evaluation_session(db, eval_in=eval_in)
    return create_response(CertificateEvaluationResponse.model_validate(eval_session).model_dump(by_alias=False))

@router.get("/evaluations")
async def read_evaluations(
    db: AsyncSession = Depends(get_db),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    current_user: User = Depends(PermissionChecker("evaluation", "read"))
) -> Any:
    evaluator_id = current_user.id if getattr(current_user, "_requires_creator_check", False) else None
        
    total = await cert_repo.count_evaluations(db, evaluator_id=evaluator_id)
    skip = (page - 1) * size
    evals = await cert_repo.get_evaluations(db, skip=skip, limit=size, evaluator_id=evaluator_id)
    
    total_pages = math.ceil(total / size) if total else 0
    data = {
        "data": [CertificateEvaluationResponse.model_validate(e).model_dump(by_alias=False) for e in evals],
        "meta": {
            "total": total,
            "page": page,
            "size": size,
            "pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }
    }
    return read_response(data)

@router.get("/evaluations/{id}")
async def read_evaluation(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    current_user: User = Depends(PermissionChecker("evaluation", "read"))
) -> Any:
    eval_session = await cert_repo.get_evaluation_by_id(db, id)
    if not eval_session:
        raise HTTPException(status_code=404, detail="Evaluation not found")
        
    if getattr(current_user, "_requires_creator_check", False) and eval_session.evaluator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your assigned evaluation")
        
    return read_response({"data": CertificateEvaluationResponse.model_validate(eval_session).model_dump(by_alias=False)})

@router.put("/evaluations/{id}")
async def grade_evaluation(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    update_in: CertificateEvaluationUpdate,
    current_user: User = Depends(PermissionChecker("evaluation", "update"))
) -> Any:
    eval_session = await cert_repo.get_evaluation_by_id(db, id)
    if not eval_session:
        raise HTTPException(status_code=404, detail="Evaluation not found")
        
    if getattr(current_user, "_requires_creator_check", False) and eval_session.evaluator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your assigned evaluation")
        
    updated_eval = await cert_svc.complete_evaluation(db, evaluation=eval_session, update_in=update_in)
    return update_response(CertificateEvaluationResponse.model_validate(updated_eval).model_dump(by_alias=False))


@router.get("/{id}")
async def read_certificate(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    cert = await cert_repo.get_certificate_by_id(db, id)
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
        
    from app.core.dependencies import has_permission
    if not await has_permission(current_user, db, "certificate", "read") and cert.member_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return read_response({"data": CertificateResponse.model_validate(cert).model_dump(by_alias=False)})

@router.put("/{id}")
async def update_certificate(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    cert_in: CertificateUpdate,
    current_user: User = Depends(PermissionChecker("certificate", "update"))
) -> Any:
    cert = await cert_repo.get_certificate_by_id(db, id)
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    updated_cert = await cert_svc.update_certificate(db, cert=cert, cert_in=cert_in)
    return update_response(CertificateResponse.model_validate(updated_cert).model_dump(by_alias=False))

@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_certificate(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    current_user: User = Depends(PermissionChecker("certificate", "delete"))
) -> Any:
    cert = await cert_repo.get_certificate_by_id(db, id)
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    await cert_repo.delete_certificate(db, cert=cert)
    return delete_response()
