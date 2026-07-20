from typing import Any
import math
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.core.dependencies import PermissionChecker
from app.api.deps import get_current_user
from app.models.user import User
from app.models.batch import Batch
from app.schemas.batch import (
    BatchCreate, BatchUpdate, BatchResponse, BatchDetailResponse,
    BatchTimetableCreate, BatchTimetableUpdate, BatchTimetableResponse, BatchEnrollmentResponse,
    BatchEnrollmentAdminCreate
)
from app.repositories import batch as batch_repo
from app.services import batch as batch_svc

router = APIRouter()


@router.get("/meta", dependencies=[Depends(PermissionChecker("batch", "read"))])
async def get_batch_meta(db: AsyncSession = Depends(get_db)) -> Any:
    meta_data = await batch_svc.get_batch_meta(db)
    return {"success": True, "data": meta_data}


@router.post("/", dependencies=[Depends(PermissionChecker("batch", "create"))])
async def create_batch(
    *,
    db: AsyncSession = Depends(get_db),
    batch_in: BatchCreate,
) -> Any:
    batch = await batch_svc.create_batch(db, batch_in=batch_in)
    return {"success": True, "data": BatchResponse.model_validate(batch)}


@router.get("/", dependencies=[Depends(PermissionChecker("batch", "read"))])
async def read_batches(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    published_only: bool = False,
) -> Any:
    skip = (page - 1) * size
    query = select(Batch)
    if published_only:
        query = query.where(Batch.published == True)

    total = await batch_repo.count_batches(db, query=query)
    batches = await batch_repo.get_batches(db, query=query, skip=skip, limit=size)
    pages = math.ceil(total / size) if size > 0 else 1

    data = [BatchResponse.model_validate(b) for b in batches]

    return {
        "success": True,
        "data": data,
        "meta": {
            "total": total,
            "page": page,
            "size": size,
            "pages": pages,
            "has_next": page < pages,
            "has_prev": page > 1,
        },
    }


@router.get("/{id}", dependencies=[Depends(PermissionChecker("batch", "read"))])
async def read_batch(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
) -> Any:
    batch = await batch_repo.get_batch_by_id(db, batch_id=id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    enrollment_count = await batch_repo.count_enrollments(db, batch_id=batch.id)
    batch_detail = BatchDetailResponse.model_validate(batch)
    batch_detail.enrollment_count = enrollment_count

    return {"success": True, "data": batch_detail}


@router.put("/{id}", dependencies=[Depends(PermissionChecker("batch", "update"))])
async def update_batch(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    batch_in: BatchUpdate,
) -> Any:
    batch = await batch_repo.get_batch_by_id(db, batch_id=id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    updated_batch = await batch_svc.update_batch(db, batch=batch, batch_in=batch_in)
    return {"success": True, "data": BatchResponse.model_validate(updated_batch)}


@router.delete("/{id}", dependencies=[Depends(PermissionChecker("batch", "delete"))])
async def delete_batch(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
) -> Any:
    batch = await batch_repo.get_batch_by_id(db, batch_id=id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    await batch_repo.delete_batch(db, batch=batch)
    return {"success": True, "message": "Successfully deleted"}


@router.post("/{id}/enroll")
async def enroll_in_batch(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    batch = await batch_repo.get_batch_by_id(db, batch_id=id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    enrollment = await batch_svc.enroll_user(db, batch=batch, user_id=current_user.id)
    return {"success": True, "data": BatchEnrollmentResponse.model_validate(enrollment)}


@router.post("/{id}/timetables")
async def create_batch_timetable(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    timetable_in: BatchTimetableCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    batch = await batch_repo.get_batch_by_id(db, batch_id=id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    timetable = await batch_svc.add_timetable(db, batch=batch, timetable_in=timetable_in)
    return {"success": True, "data": BatchTimetableResponse.model_validate(timetable)}


@router.put("/{id}/timetables/{timetable_id}")
async def update_batch_timetable(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    timetable_id: str,
    timetable_in: BatchTimetableUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    batch = await batch_repo.get_batch_by_id(db, batch_id=id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    timetable = await batch_repo.get_timetable_entry_by_id(db, timetable_id=timetable_id)
    if not timetable or timetable.batch_id != batch.id:
        raise HTTPException(status_code=404, detail="Timetable entry not found")

    updated_timetable = await batch_svc.update_timetable(db, batch=batch, timetable=timetable, timetable_in=timetable_in)
    return {"success": True, "data": BatchTimetableResponse.model_validate(updated_timetable)}


@router.delete("/{id}/timetables/{timetable_id}")
async def delete_batch_timetable(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    timetable_id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    batch = await batch_repo.get_batch_by_id(db, batch_id=id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    timetable = await batch_repo.get_timetable_entry_by_id(db, timetable_id=timetable_id)
    if not timetable or timetable.batch_id != batch.id:
        raise HTTPException(status_code=404, detail="Timetable entry not found")

    await batch_svc.remove_timetable(db, timetable=timetable)
    return {"success": True, "message": "Successfully deleted"}


@router.get("/{id}/enrollments", dependencies=[Depends(PermissionChecker("batch", "read"))])
async def read_batch_enrollments(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
) -> Any:
    batch = await batch_repo.get_batch_by_id(db, batch_id=id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    skip = (page - 1) * size
    total = await batch_repo.count_enrollments(db, batch_id=batch.id)
    enrollments = await batch_repo.get_batch_enrollments(db, batch_id=batch.id, skip=skip, limit=size)

    # Resolve payments made for the batch's associated courses if direct batch payment is missing
    course_ids = [bc.course_id for bc in batch.courses]
    unpaid_members = [e.member_id for e in enrollments if not e.payment]
    if course_ids and unpaid_members:
        from app.models.payment import Payment, PaymentForType
        pay_query = select(Payment).where(
            Payment.member_id.in_(unpaid_members),
            Payment.payment_for_type == PaymentForType.COURSE,
            Payment.payment_for_id.in_(course_ids)
        )
        res = await db.execute(pay_query)
        payments_list = res.scalars().all()

        payments_lookup = {}
        for p in payments_list:
            # Prefer completed payments
            if p.member_id not in payments_lookup or p.status == "Completed":
                payments_lookup[p.member_id] = p

        for e in enrollments:
            if not e.payment and e.member_id in payments_lookup:
                e.course_payment = payments_lookup[e.member_id]

    pages = math.ceil(total / size) if size > 0 else 1

    data = [BatchEnrollmentResponse.model_validate(e) for e in enrollments]

    return {
        "success": True,
        "data": data,
        "meta": {
            "total": total,
            "page": page,
            "size": size,
            "pages": pages,
            "has_next": page < pages,
            "has_prev": page > 1,
        },
    }


@router.post("/{id}/enrollments", dependencies=[Depends(PermissionChecker("batch", "update"))])
async def create_batch_enrollment(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    enrollment_in: BatchEnrollmentAdminCreate,
) -> Any:
    batch = await batch_repo.get_batch_by_id(db, batch_id=id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    enrollment = await batch_svc.admin_enroll_user(
        db,
        batch=batch,
        member_public_id=enrollment_in.member_public_id,
        is_paid=enrollment_in.is_paid,
        payment_public_id=enrollment_in.payment_public_id,
    )
    return {"success": True, "data": BatchEnrollmentResponse.model_validate(enrollment)}


@router.delete("/{id}/enrollments/{enrollment_id}", dependencies=[Depends(PermissionChecker("batch", "update"))])
async def delete_batch_enrollment(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    enrollment_id: str,
) -> Any:
    batch = await batch_repo.get_batch_by_id(db, batch_id=id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    enrollment = await batch_repo.get_batch_enrollment_by_id(db, enrollment_id=enrollment_id)
    if not enrollment or enrollment.batch_id != batch.id:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    await batch_repo.delete_batch_enrollment(db, enrollment=enrollment)
    return {"success": True, "message": "Successfully deleted"}
