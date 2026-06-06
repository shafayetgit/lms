from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_admin_or_instructor
from app.core.responses import create_response, read_response, update_response, delete_response
from app.schemas.module import ModuleCreate, ModuleUpdate, ModuleRead, ModuleListResponse
from app.services import module as module_service

router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_admin_or_instructor)])
async def create_module(
    module_in: ModuleCreate, 
    db: AsyncSession = Depends(get_db)
):
    """Create a new module. Admin/Instructor only."""
    try:
        await module_service.create_module(db, module_in)
        return create_response()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/course/{course_id}", response_model=ModuleListResponse)
async def read_modules_by_course(
    course_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """Retrieve modules for a course (Public)."""
    data = await module_service.get_modules_by_course(db, course_id)
    items = [ModuleRead.model_validate(item).model_dump(by_alias=False) for item in data]
    return read_response({"data": items})

@router.get("/{module_id}", response_model=ModuleRead)
async def read_module(
    module_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """Get module by ID."""
    module = await module_service.get_module(db, module_id)
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
    return read_response(ModuleRead.model_validate(module).model_dump(by_alias=False))

from fastapi import Body

@router.put("/course/{course_id}/reorder", status_code=status.HTTP_200_OK)
async def reorder_course_modules(
    course_id: int,
    order: List[dict] = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Bulk reorder modules within a course. Expects [{id, order_index}, ...]"""
    await module_service.reorder_modules(db, course_id, order)
    return update_response(None, message="Modules reordered successfully")

@router.put("/{module_id}")
async def update_module(
    module_id: int, 
    module_in: ModuleUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Update a module. Admin/Instructor only."""
    try:
        await module_service.update_module(db, module_id, module_in)
        return update_response()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_module(
    module_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Delete a module. Admin/Instructor only."""
    try:
        await module_service.delete_module(db, module_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

