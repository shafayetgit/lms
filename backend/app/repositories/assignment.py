from typing import Sequence, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.assignment import Assignment, AssignmentSubmission

async def create_assignment(db: AsyncSession, assignment: Assignment) -> Assignment:
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)
    return assignment

async def get_assignment_by_id(db: AsyncSession, id: int | str) -> Optional[Assignment]:
    if isinstance(id, int) or (isinstance(id, str) and id.isdigit()):
        query = select(Assignment).where(Assignment.id == int(id))
    else:
        query = select(Assignment).where(Assignment.public_id == str(id))
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_assignments(
    db: AsyncSession, skip: int = 0, limit: int = 10, course_id: Optional[int] = None
) -> Sequence[Assignment]:
    query = select(Assignment)
    if course_id is not None:
        from sqlalchemy import or_
        query = query.where(or_(Assignment.course_id == course_id, Assignment.course_id.is_(None)))
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def count_assignments(db: AsyncSession, course_id: Optional[int] = None) -> int:
    query = select(func.count(Assignment.id))
    if course_id is not None:
        from sqlalchemy import or_
        query = query.where(or_(Assignment.course_id == course_id, Assignment.course_id.is_(None)))
    result = await db.execute(query)
    return result.scalar() or 0

async def update_assignment(db: AsyncSession, assignment: Assignment) -> Assignment:
    await db.commit()
    await db.refresh(assignment)
    return assignment

async def delete_assignment(db: AsyncSession, assignment: Assignment) -> None:
    await db.delete(assignment)
    await db.commit()

async def create_submission(db: AsyncSession, submission: AssignmentSubmission) -> AssignmentSubmission:
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    return submission

async def get_submission(db: AsyncSession, assignment_id: int, member_id: int) -> Optional[AssignmentSubmission]:
    query = select(AssignmentSubmission).where(
        AssignmentSubmission.assignment_id == assignment_id,
        AssignmentSubmission.member_id == member_id
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_submissions_by_assignment(
    db: AsyncSession, assignment_id: int, skip: int = 0, limit: int = 10
) -> Sequence[AssignmentSubmission]:
    query = select(AssignmentSubmission).options(
        selectinload(AssignmentSubmission.member)
    ).where(
        AssignmentSubmission.assignment_id == assignment_id
    ).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def count_submissions_by_assignment(db: AsyncSession, assignment_id: int) -> int:
    query = select(func.count(AssignmentSubmission.id)).where(
        AssignmentSubmission.assignment_id == assignment_id
    )
    result = await db.execute(query)
    return result.scalar() or 0

async def get_submission_by_id(db: AsyncSession, sub_id: int | str) -> Optional[AssignmentSubmission]:
    if isinstance(sub_id, int) or (isinstance(sub_id, str) and sub_id.isdigit()):
        query = select(AssignmentSubmission).options(
            selectinload(AssignmentSubmission.member)
        ).where(AssignmentSubmission.id == int(sub_id))
    else:
        query = select(AssignmentSubmission).options(
            selectinload(AssignmentSubmission.member)
        ).where(AssignmentSubmission.public_id == str(sub_id))
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def update_submission(db: AsyncSession, submission: AssignmentSubmission) -> AssignmentSubmission:
    await db.commit()
    await db.refresh(submission)
    return submission
