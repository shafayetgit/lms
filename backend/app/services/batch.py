from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from sqlalchemy import select, func
from app.models.batch import Batch, BatchCourse, BatchTimetable, BatchEnrollment
from app.models.category import Category
from app.models.course import Course
from app.models.user import User
from app.models.role import Role
from app.schemas.batch import BatchCreate, BatchUpdate, BatchTimetableCreate, BatchTimetableUpdate
from app.repositories import batch as batch_repo


def _validate_batch_fields(batch_data: dict, courses: list = None):
    # Validate start_date and end_date
    start_date = batch_data.get("start_date")
    end_date = batch_data.get("end_date")
    if start_date and end_date and end_date < start_date:
        raise HTTPException(status_code=400, detail="Batch end date cannot be before the start date.")

    # Validate start_time and end_time
    start_time = batch_data.get("start_time")
    end_time = batch_data.get("end_time")
    if start_time and end_time and start_time >= end_time:
        raise HTTPException(status_code=400, detail="Batch start time cannot be greater than or equal to end time.")

    # Validate seat_count
    seat_count = batch_data.get("seat_count")
    if seat_count is not None and seat_count < 0:
        raise HTTPException(status_code=400, detail="Seat count cannot be negative.")

    # Validate paid batch
    paid_batch = batch_data.get("paid_batch")
    if paid_batch:
        amount = batch_data.get("amount")
        currency = batch_data.get("currency")
        if amount is None or not currency:
            raise HTTPException(status_code=400, detail="Amount and currency are required for paid batches.")

    # Validate evaluation end date
    evaluation = batch_data.get("evaluation")
    evaluation_end_date = batch_data.get("evaluation_end_date")
    if evaluation and evaluation_end_date and end_date and evaluation_end_date < end_date:
        raise HTTPException(status_code=400, detail="Evaluation end date cannot be before the batch end date.")

    # Validate duplicate courses
    if courses:
        course_ids = [c.course_id if hasattr(c, "course_id") else c.get("course_id") for c in courses]
        if len(course_ids) != len(set(course_ids)):
            raise HTTPException(status_code=400, detail="Duplicate courses are not allowed in the same batch.")


async def create_batch(db: AsyncSession, batch_in: BatchCreate) -> Batch:
    batch_dict = batch_in.model_dump()
    _validate_batch_fields(batch_dict, courses=batch_in.courses)

    data = batch_in.model_dump(exclude={"courses"})
    batch = Batch(**data)

    if batch_in.courses:
        for bc in batch_in.courses:
            batch.courses.append(BatchCourse(course_id=bc.course_id, evaluator_id=bc.evaluator_id))

    created = await batch_repo.create_batch(db, batch)
    return await batch_repo.get_batch_by_id(db, created.id)


async def update_batch(db: AsyncSession, batch: Batch, batch_in: BatchUpdate) -> Batch:
    update_dict = batch_in.model_dump(exclude_unset=True)
    merged_data = {**batch.__dict__, **update_dict}
    _validate_batch_fields(merged_data, courses=batch_in.courses if batch_in.courses is not None else None)

    update_data = batch_in.model_dump(exclude_unset=True, exclude={"courses"})
    for field, value in update_data.items():
        setattr(batch, field, value)

    if batch_in.courses is not None:
        batch.courses.clear()
        for bc in batch_in.courses:
            batch.courses.append(BatchCourse(course_id=bc.course_id, evaluator_id=bc.evaluator_id))

    updated = await batch_repo.update_batch(db, batch)
    return await batch_repo.get_batch_by_id(db, updated.id)


async def enroll_user(db: AsyncSession, batch: Batch, user_id: int) -> BatchEnrollment:
    if not batch.allow_self_enrollment:
        raise HTTPException(status_code=400, detail="Self enrollment is disabled for this batch.")

    if batch.seat_count and batch.seat_count > 0:
        current_count = await batch_repo.count_enrollments(db, batch.id)
        if current_count >= batch.seat_count:
            raise HTTPException(status_code=400, detail="Batch is full. No seats available.")

    existing = await batch_repo.get_enrollment(db, batch.id, user_id)
    if existing:
        raise HTTPException(status_code=400, detail="User is already enrolled in this batch.")

    enrollment = BatchEnrollment(batch_id=batch.id, member_id=user_id, is_paid=batch.paid_batch)
    created = await batch_repo.create_enrollment(db, enrollment)
    return await batch_repo.get_batch_enrollment_by_id(db, created.id)


async def admin_enroll_user(
    db: AsyncSession,
    batch: Batch,
    member_public_id: str,
    is_paid: bool = False,
    payment_public_id: str = None
) -> BatchEnrollment:
    user_res = await db.execute(select(User).where(User.public_id == member_public_id))
    user = user_res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if batch.seat_count and batch.seat_count > 0:
        current_count = await batch_repo.count_enrollments(db, batch.id)
        if current_count >= batch.seat_count:
            raise HTTPException(status_code=400, detail="Batch is full. No seats available.")

    existing = await batch_repo.get_enrollment(db, batch.id, user.id)
    if existing:
        raise HTTPException(status_code=400, detail="User is already enrolled in this batch.")

    if payment_public_id:
        from app.models.payment import Payment, PaymentForType
        pay_res = await db.execute(select(Payment).where(Payment.public_id == payment_public_id))
        payment = pay_res.scalars().first()
        if payment:
            payment.payment_for_type = PaymentForType.BATCH
            payment.payment_for_id = batch.id
            if payment.status == "Completed":
                is_paid = True

    enrollment = BatchEnrollment(batch_id=batch.id, member_id=user.id, is_paid=is_paid)
    created = await batch_repo.create_enrollment(db, enrollment)
    return await batch_repo.get_batch_enrollment_by_id(db, created.id)


async def add_timetable(db: AsyncSession, batch: Batch, timetable_in: BatchTimetableCreate) -> BatchTimetable:
    # Timetable validation
    if timetable_in.start_time >= timetable_in.end_time:
        raise HTTPException(status_code=400, detail="Timetable start time cannot be greater than or equal to end time.")

    if batch.start_date and timetable_in.date < batch.start_date:
        raise HTTPException(status_code=400, detail="Timetable date cannot be before batch start date.")

    if batch.end_date and timetable_in.date > batch.end_date:
        raise HTTPException(status_code=400, detail="Timetable date cannot be after batch end date.")

    timetable = BatchTimetable(batch_id=batch.id, **timetable_in.model_dump())
    return await batch_repo.create_timetable_entry(db, timetable)


async def update_timetable(
    db: AsyncSession, batch: Batch, timetable: BatchTimetable, timetable_in: BatchTimetableUpdate
) -> BatchTimetable:
    new_start = timetable_in.start_time if timetable_in.start_time is not None else timetable.start_time
    new_end = timetable_in.end_time if timetable_in.end_time is not None else timetable.end_time
    if new_start >= new_end:
        raise HTTPException(status_code=400, detail="Timetable start time cannot be greater than or equal to end time.")

    new_date = timetable_in.date if timetable_in.date is not None else timetable.date
    if batch.start_date and new_date < batch.start_date:
        raise HTTPException(status_code=400, detail="Timetable date cannot be before batch start date.")
    if batch.end_date and new_date > batch.end_date:
        raise HTTPException(status_code=400, detail="Timetable date cannot be after batch end date.")

    return await batch_repo.update_timetable_entry(db, timetable, timetable_in)


async def remove_timetable(db: AsyncSession, timetable: BatchTimetable):
    await batch_repo.delete_timetable_entry(db, timetable)


async def get_batch_meta(db: AsyncSession) -> dict:
    # Categories
    categories_res = await db.execute(
        select(Category.id.label("value"), Category.name.label("label")).order_by(Category.name)
    )
    categories = [dict(r._mapping) for r in categories_res.all()]

    # Courses
    courses_res = await db.execute(
        select(Course.id.label("value"), Course.title.label("label")).order_by(Course.title)
    )
    courses = [dict(r._mapping) for r in courses_res.all()]

    # Evaluators / Instructors (Users with instructor or admin role)
    evaluators_res = await db.execute(
        select(
            User.id.label("value"),
            func.concat(User.first_name, " ", User.last_name, " (", User.email, ")").label("label"),
        )
        .join(User.roles)
        .where(
            Role.slug.in_(["instructor", "admin", "super-admin"]),
            User.is_active,
        )
        .order_by(User.first_name)
    )
    evaluators = [dict(r._mapping) for r in evaluators_res.all()]

    return {
        "categories": categories,
        "courses": courses,
        "evaluators": evaluators,
    }
