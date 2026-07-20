from sqlalchemy import select, func, Select
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.batch import Batch, BatchCourse, BatchTimetable, BatchEnrollment
from app.models.course import Course
from app.models.category import Category

async def create_batch(db: AsyncSession, batch: Batch) -> Batch:
    db.add(batch)
    await db.commit()
    await db.refresh(batch)
    return batch

async def get_batch_by_id(db: AsyncSession, batch_id: int | str) -> Batch | None:
    query = (
        select(Batch)
        .options(
            selectinload(Batch.courses).joinedload(BatchCourse.course).load_only(Course.id, Course.title),
            selectinload(Batch.timetables),
            joinedload(Batch.category).load_only(Category.id, Category.name)
        )
    )
    if isinstance(batch_id, int) or (isinstance(batch_id, str) and batch_id.isdigit()):
        query = query.where(Batch.id == int(batch_id))
    else:
        query = query.where(Batch.public_id == str(batch_id))

    result = await db.execute(query)
    return result.unique().scalar_one_or_none()

async def get_batches(
    db: AsyncSession, query: Select | None = None, skip: int = 0, limit: int = 10
) -> list[Batch]:
    q = query if query is not None else select(Batch)
    q = q.options(
        joinedload(Batch.courses).joinedload(BatchCourse.course).load_only(Course.id, Course.title)
    )
    result = await db.execute(q.offset(skip).limit(limit))
    return result.unique().scalars().all()

async def count_batches(db: AsyncSession, query: Select | None = None) -> int:
    q = query if query is not None else select(Batch)
    return await db.scalar(select(func.count()).select_from(q.subquery()))

async def update_batch(db: AsyncSession, batch: Batch) -> Batch:
    await db.commit()
    await db.refresh(batch)
    return batch

async def delete_batch(db: AsyncSession, batch: Batch):
    await db.delete(batch)
    await db.commit()

# Timetable
async def create_timetable_entry(db: AsyncSession, timetable: BatchTimetable) -> BatchTimetable:
    db.add(timetable)
    await db.commit()
    await db.refresh(timetable)
    return timetable

async def get_timetables_by_batch(db: AsyncSession, batch_id: int) -> list[BatchTimetable]:
    query = select(BatchTimetable).where(BatchTimetable.batch_id == batch_id).order_by(BatchTimetable.date, BatchTimetable.start_time)
    result = await db.execute(query)
    return result.scalars().all()

async def get_timetable_entry_by_id(db: AsyncSession, timetable_id: int | str) -> BatchTimetable | None:
    if isinstance(timetable_id, int) or (isinstance(timetable_id, str) and timetable_id.isdigit()):
        query = select(BatchTimetable).where(BatchTimetable.id == int(timetable_id))
    else:
        query = select(BatchTimetable).where(BatchTimetable.public_id == str(timetable_id))
    result = await db.execute(query)
    return result.scalars().first()

async def update_timetable_entry(db: AsyncSession, timetable: BatchTimetable, timetable_in) -> BatchTimetable:
    update_data = timetable_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(timetable, field, value)
    await db.commit()
    await db.refresh(timetable)
    return timetable

async def delete_timetable_entry(db: AsyncSession, timetable: BatchTimetable):
    await db.delete(timetable)
    await db.commit()

# Enrollment
async def count_enrollments(db: AsyncSession, batch_id: int) -> int:
    return await db.scalar(select(func.count(BatchEnrollment.id)).where(BatchEnrollment.batch_id == batch_id))

async def get_enrollment(db: AsyncSession, batch_id: int, member_id: int) -> BatchEnrollment | None:
    query = select(BatchEnrollment).where(BatchEnrollment.batch_id == batch_id, BatchEnrollment.member_id == member_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def create_enrollment(db: AsyncSession, enrollment: BatchEnrollment) -> BatchEnrollment:
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    return enrollment

async def get_batch_enrollments(db: AsyncSession, batch_id: int, skip: int = 0, limit: int = 10) -> list[BatchEnrollment]:
    query = (
        select(BatchEnrollment)
        .where(BatchEnrollment.batch_id == batch_id)
        .options(selectinload(BatchEnrollment.member), selectinload(BatchEnrollment.payment))
        .order_by(BatchEnrollment.id.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()

async def get_batch_enrollment_by_id(db: AsyncSession, enrollment_id: int | str) -> BatchEnrollment | None:
    if isinstance(enrollment_id, int) or (isinstance(enrollment_id, str) and enrollment_id.isdigit()):
        query = select(BatchEnrollment).where(BatchEnrollment.id == int(enrollment_id)).options(selectinload(BatchEnrollment.member), selectinload(BatchEnrollment.payment))
    else:
        query = select(BatchEnrollment).where(BatchEnrollment.public_id == str(enrollment_id)).options(selectinload(BatchEnrollment.member), selectinload(BatchEnrollment.payment))
    result = await db.execute(query)
    return result.scalars().first()

async def delete_batch_enrollment(db: AsyncSession, enrollment: BatchEnrollment):
    await db.delete(enrollment)
    await db.commit()
