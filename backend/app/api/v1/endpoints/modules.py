from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_admin_or_instructor
from app.schemas.module import ModuleCreate, ModuleUpdate, ModuleRead
from app.services import module as module_service

router = APIRouter()

@router.post("/", response_model=ModuleRead, status_code=status.HTTP_201_CREATED)
async def create_module(
    module_in: ModuleCreate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Create a new module. Admin/Instructor only."""
    try:
        return await module_service.create_module(db, module_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/course/{course_id}", response_model=List[ModuleRead])
async def read_modules_by_course(
    course_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """Retrieve modules for a course (Public)."""
    return await module_service.get_modules_by_course(db, course_id)

@router.get("/{module_id}", response_model=ModuleRead)
async def read_module(
    module_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """Get module by ID."""
    module = await module_service.get_module(db, module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module

@router.put("/{module_id}", response_model=ModuleRead)
async def update_module(
    module_id: int, 
    module_in: ModuleUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Update a module. Admin/Instructor only."""
    try:
        return await module_service.update_module(db, module_id, module_in)
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
