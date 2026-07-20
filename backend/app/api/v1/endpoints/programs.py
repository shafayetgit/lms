from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_db, get_current_user
from app.core.dependencies import PermissionChecker
from app.models.user import User
from app.models.program import Program
from app.schemas.program import (
    ProgramCreate, ProgramUpdate, ProgramResponse, ProgramDetailResponse, ProgramMemberResponse
)
from app.repositories import program as program_repo
from app.services import program as program_svc
from app.core.responses import read_response, create_response, update_response, delete_response

router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED, dependencies=[Depends(PermissionChecker("program", "create"))])
async def create_program(
    *,
    db: AsyncSession = Depends(get_db),
    program_in: ProgramCreate,
) -> Any:
    program = await program_svc.create_program(db, program_in=program_in)
    return create_response(ProgramResponse.model_validate(program).model_dump(by_alias=False))

@router.get("/")
async def read_programs(
    db: AsyncSession = Depends(get_db),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    term: str | None = None,
    published_only: bool = False,
    current_user=Depends(PermissionChecker("program", "read"))
) -> Any:
    query = select(Program)
    if published_only:
        query = query.where(Program.published == True)
    if term:
        query = query.where(Program.title.ilike(f"%{term}%"))
        
    total = await program_repo.count_programs(db, query=query)
    skip = (page - 1) * size
    programs = await program_repo.get_programs(db, query=query, skip=skip, limit=size)
    
    import math
    total_pages = math.ceil(total / size) if total else 0
    
    data = {
        "data": [ProgramResponse.model_validate(p).model_dump(by_alias=False) for p in programs],
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

async def _get_program(db: AsyncSession, id: str) -> Program | None:
    if id.isdigit():
        return await program_repo.get_program_by_id(db, program_id=int(id))
    return await program_repo.get_program_by_public_id(db, public_id=id)


@router.get("/{id}", dependencies=[Depends(PermissionChecker("program", "read"))])
async def read_program(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
) -> Any:
    program = await _get_program(db, id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
        
    return read_response({"data": ProgramDetailResponse.model_validate(program).model_dump(by_alias=False)})

@router.put("/{id}", dependencies=[Depends(PermissionChecker("program", "update"))])
async def update_program(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    program_in: ProgramUpdate,
) -> Any:
    program = await _get_program(db, id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
        
    program = await program_svc.update_program(db, program=program, program_in=program_in)
    return update_response(ProgramResponse.model_validate(program).model_dump(by_alias=False))

@router.delete("/{id}", status_code=status.HTTP_200_OK, dependencies=[Depends(PermissionChecker("program", "delete"))])
async def delete_program(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
) -> Any:
    program = await _get_program(db, id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
        
    await program_repo.delete_program(db, program=program)
    return delete_response("Successfully deleted")

@router.post("/{id}/enroll")
async def enroll_in_program(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    program = await _get_program(db, id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
        
    membership = await program_svc.enroll_member(db, program=program, user_id=current_user.id)
    return create_response(ProgramMemberResponse.model_validate(membership).model_dump(by_alias=False))

@router.get("/{id}/members")
async def read_program_members(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    program = await _get_program(db, id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
        
    members = await program_repo.get_members(db, program_id=program.id)
    data = [ProgramMemberResponse.model_validate(m).model_dump(by_alias=False) for m in members]
    return read_response({"data": data})
