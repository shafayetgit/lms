from sqlalchemy import select, func, Select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.program import Program, ProgramCourse, ProgramMember


async def create_program(db: AsyncSession, program: Program) -> Program:
    db.add(program)
    await db.commit()
    res = await get_program_by_id(db, program.id)
    if res is None:
        raise ValueError("Program not found after creation")
    return res


async def get_program_by_id(db: AsyncSession, program_id: int) -> Program | None:
    query = (
        select(Program)
        .options(joinedload(Program.courses).joinedload(ProgramCourse.course))
        .where(Program.id == program_id)
    )
    result = await db.execute(query)
    return result.unique().scalar_one_or_none()


async def get_program_by_public_id(db: AsyncSession, public_id: str) -> Program | None:
    query = (
        select(Program)
        .options(joinedload(Program.courses).joinedload(ProgramCourse.course))
        .where(Program.public_id == public_id)
    )
    result = await db.execute(query)
    return result.unique().scalar_one_or_none()


async def get_programs(
    db: AsyncSession, query: Select | None = None, skip: int = 0, limit: int = 10
) -> list[Program]:
    q = query if query is not None else select(Program)
    q = q.options(joinedload(Program.courses).joinedload(ProgramCourse.course))
    result = await db.execute(q.offset(skip).limit(limit))
    return list(result.unique().scalars().all())


async def count_programs(db: AsyncSession, query: Select | None = None) -> int:
    q = query if query is not None else select(Program)
    return await db.scalar(select(func.count()).select_from(q.subquery()))


async def update_program(db: AsyncSession, program: Program) -> Program:
    await db.commit()
    res = await get_program_by_id(db, program.id)
    if res is None:
        raise ValueError("Program not found after update")
    return res


async def delete_program(db: AsyncSession, program: Program):
    await db.delete(program)
    await db.commit()


# Membership
async def get_membership(db: AsyncSession, program_id: int, member_id: int) -> ProgramMember | None:
    query = select(ProgramMember).where(
        ProgramMember.program_id == program_id,
        ProgramMember.member_id == member_id
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def create_membership(db: AsyncSession, membership: ProgramMember) -> ProgramMember:
    db.add(membership)
    await db.commit()
    from app.models.user import User
    query = (
        select(ProgramMember)
        .options(
            joinedload(ProgramMember.member).joinedload(User.roles),
            joinedload(ProgramMember.member).joinedload(User.feature_flags)
        )
        .where(ProgramMember.id == membership.id)
    )
    result = await db.execute(query)
    return result.unique().scalar_one()


async def get_members(db: AsyncSession, program_id: int) -> list[ProgramMember]:
    from app.models.user import User
    query = (
        select(ProgramMember)
        .options(
            joinedload(ProgramMember.member).joinedload(User.roles),
            joinedload(ProgramMember.member).joinedload(User.feature_flags)
        )
        .where(ProgramMember.program_id == program_id)
    )
    result = await db.execute(query)
    return list(result.unique().scalars().all())


async def count_members(db: AsyncSession, program_id: int) -> int:
    query = select(func.count(ProgramMember.id)).where(ProgramMember.program_id == program_id)
    return await db.scalar(query)


async def recalculate_progress(db: AsyncSession, program_id: int, member_id: int):
    # Progress calculation is handled in service where we check CourseProgress, this is just a hook if needed in repo
    pass
