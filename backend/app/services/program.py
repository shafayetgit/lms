from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from sqlalchemy import select, func

from app.models.program import Program, ProgramCourse, ProgramMember
from app.models.course_progress import CourseProgress
from app.schemas.program import ProgramCreate, ProgramUpdate
from app.repositories import program as program_repo

async def create_program(db: AsyncSession, program_in: ProgramCreate) -> Program:
    data = program_in.model_dump(exclude={"courses"})
    program = Program(**data)
    
    if program_in.courses:
        for idx, pc in enumerate(program_in.courses):
            program.courses.append(ProgramCourse(course_id=pc.course_id, order_index=pc.order_index or idx))
        program.course_count = len(program_in.courses)
            
    return await program_repo.create_program(db, program)

async def update_program(db: AsyncSession, program: Program, program_in: ProgramUpdate) -> Program:
    update_data = program_in.model_dump(exclude_unset=True, exclude={"courses"})
    for field, value in update_data.items():
        setattr(program, field, value)
        
    if program_in.courses is not None:
        program.courses.clear()
        for idx, pc in enumerate(program_in.courses):
            program.courses.append(ProgramCourse(course_id=pc.course_id, order_index=pc.order_index or idx))
        program.course_count = len(program_in.courses)
            
    return await program_repo.update_program(db, program)

async def enroll_member(db: AsyncSession, program: Program, user_id: int) -> ProgramMember:
    existing = await program_repo.get_membership(db, program.id, user_id)
    if existing:
        raise HTTPException(status_code=400, detail="User already enrolled in this program.")
        
    membership = ProgramMember(program_id=program.id, member_id=user_id)
    membership = await program_repo.create_membership(db, membership)
    
    program.member_count += 1
    await program_repo.update_program(db, program)
    
    # Optionally, you could automatically enroll the student into all `Course` entities here.
    return membership

async def recalculate_member_progress(db: AsyncSession, program_id: int, member_id: int):
    import math
    program = await program_repo.get_program_by_id(db, program_id)
    membership = await program_repo.get_membership(db, program_id, member_id)
    
    if not program or not membership or not program.courses:
        return
        
    course_ids = [pc.course_id for pc in program.courses]
    from app.models.enrollment import Enrollment
    enr_res = await db.execute(
        select(Enrollment.progress).where(
            Enrollment.user_id == member_id,
            Enrollment.course_id.in_(course_ids),
        )
    )
    progresses = enr_res.scalars().all()
    total_progress = sum(p or 0.0 for p in progresses)
    membership.progress = float(math.ceil(total_progress / len(course_ids)))
    await db.commit()
