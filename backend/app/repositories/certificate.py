from typing import Sequence, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.certificate import Certificate, CertificateEvaluation, CertificateRequest

# ---------------- CERTIFICATES ---------------- #

async def create_certificate(db: AsyncSession, certificate: Certificate) -> Certificate:
    db.add(certificate)
    await db.commit()
    return await get_certificate_by_id(db, certificate.id)

async def get_certificate_by_id(db: AsyncSession, id: int | str) -> Optional[Certificate]:
    from sqlalchemy.orm import selectinload
    query = select(Certificate).options(
        selectinload(Certificate.member),
        selectinload(Certificate.course),
        selectinload(Certificate.batch)
    )
    if isinstance(id, int) or (isinstance(id, str) and id.isdigit()):
        query = query.where(Certificate.id == int(id))
    else:
        query = query.where(Certificate.public_id == str(id))
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_certificates(
    db: AsyncSession, skip: int = 0, limit: int = 10, member_id: Optional[int] = None, course_id: Optional[int] = None
) -> Sequence[Certificate]:
    from sqlalchemy.orm import selectinload
    query = select(Certificate).options(
        selectinload(Certificate.member),
        selectinload(Certificate.course),
        selectinload(Certificate.batch)
    )
    if member_id is not None:
        query = query.where(Certificate.member_id == member_id)
    if course_id is not None:
        query = query.where(Certificate.course_id == course_id)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def count_certificates(
    db: AsyncSession, member_id: Optional[int] = None, course_id: Optional[int] = None
) -> int:
    query = select(func.count(Certificate.id))
    if member_id is not None:
        query = query.where(Certificate.member_id == member_id)
    if course_id is not None:
        query = query.where(Certificate.course_id == course_id)
    result = await db.execute(query)
    return result.scalar() or 0

async def update_certificate(db: AsyncSession, certificate: Certificate) -> Certificate:
    await db.commit()
    await db.refresh(certificate)
    return certificate

async def delete_certificate(db: AsyncSession, certificate: Certificate) -> None:
    await db.delete(certificate)
    await db.commit()


# ---------------- EVALUATIONS ---------------- #

async def create_evaluation(db: AsyncSession, evaluation: CertificateEvaluation) -> CertificateEvaluation:
    db.add(evaluation)
    await db.commit()
    return await get_evaluation_by_id(db, evaluation.id)

async def get_evaluation_by_id(db: AsyncSession, id: int | str) -> Optional[CertificateEvaluation]:
    from sqlalchemy.orm import selectinload
    query = select(CertificateEvaluation).options(
        selectinload(CertificateEvaluation.member),
        selectinload(CertificateEvaluation.evaluator),
        selectinload(CertificateEvaluation.course),
        selectinload(CertificateEvaluation.batch)
    )
    if isinstance(id, int) or (isinstance(id, str) and id.isdigit()):
        query = query.where(CertificateEvaluation.id == int(id))
    else:
        query = query.where(CertificateEvaluation.public_id == str(id))
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_evaluations(
    db: AsyncSession, skip: int = 0, limit: int = 10, member_id: Optional[int] = None, evaluator_id: Optional[int] = None
) -> Sequence[CertificateEvaluation]:
    from sqlalchemy.orm import selectinload
    query = select(CertificateEvaluation).options(
        selectinload(CertificateEvaluation.member),
        selectinload(CertificateEvaluation.evaluator),
        selectinload(CertificateEvaluation.course),
        selectinload(CertificateEvaluation.batch)
    )
    if member_id is not None:
        query = query.where(CertificateEvaluation.member_id == member_id)
    if evaluator_id is not None:
        query = query.where(CertificateEvaluation.evaluator_id == evaluator_id)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def count_evaluations(
    db: AsyncSession, member_id: Optional[int] = None, evaluator_id: Optional[int] = None
) -> int:
    query = select(func.count(CertificateEvaluation.id))
    if member_id is not None:
        query = query.where(CertificateEvaluation.member_id == member_id)
    if evaluator_id is not None:
        query = query.where(CertificateEvaluation.evaluator_id == evaluator_id)
    result = await db.execute(query)
    return result.scalar() or 0

async def update_evaluation(db: AsyncSession, evaluation: CertificateEvaluation) -> CertificateEvaluation:
    await db.commit()
    await db.refresh(evaluation)
    return evaluation


# ---------------- REQUESTS ---------------- #

async def create_request(db: AsyncSession, request: CertificateRequest) -> CertificateRequest:
    db.add(request)
    await db.commit()
    return await get_request_by_id(db, request.id)

async def get_request_by_id(db: AsyncSession, id: int | str) -> Optional[CertificateRequest]:
    from sqlalchemy.orm import selectinload
    query = select(CertificateRequest).options(
        selectinload(CertificateRequest.member),
        selectinload(CertificateRequest.evaluator),
        selectinload(CertificateRequest.course),
        selectinload(CertificateRequest.batch)
    )
    if isinstance(id, int) or (isinstance(id, str) and id.isdigit()):
        query = query.where(CertificateRequest.id == int(id))
    else:
        query = query.where(CertificateRequest.public_id == str(id))
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_request_by_member_and_course(
    db: AsyncSession, member_id: int, course_id: int
) -> Optional[CertificateRequest]:
    from sqlalchemy.orm import selectinload
    query = select(CertificateRequest).options(
        selectinload(CertificateRequest.member),
        selectinload(CertificateRequest.evaluator),
        selectinload(CertificateRequest.course),
        selectinload(CertificateRequest.batch)
    ).where(
        CertificateRequest.member_id == member_id,
        CertificateRequest.course_id == course_id
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_requests(
    db: AsyncSession, skip: int = 0, limit: int = 10, member_id: Optional[int] = None, status: Optional[str] = None
) -> Sequence[CertificateRequest]:
    from sqlalchemy.orm import selectinload
    query = select(CertificateRequest).options(
        selectinload(CertificateRequest.member),
        selectinload(CertificateRequest.evaluator),
        selectinload(CertificateRequest.course),
        selectinload(CertificateRequest.batch)
    )
    if member_id is not None:
        query = query.where(CertificateRequest.member_id == member_id)
    if status is not None:
        query = query.where(CertificateRequest.status == status)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def count_requests(
    db: AsyncSession, member_id: Optional[int] = None, status: Optional[str] = None
) -> int:
    query = select(func.count(CertificateRequest.id))
    if member_id is not None:
        query = query.where(CertificateRequest.member_id == member_id)
    if status is not None:
        query = query.where(CertificateRequest.status == status)
    result = await db.execute(query)
    return result.scalar() or 0

async def update_request(db: AsyncSession, request: CertificateRequest) -> CertificateRequest:
    await db.commit()
    await db.refresh(request)
    return request
