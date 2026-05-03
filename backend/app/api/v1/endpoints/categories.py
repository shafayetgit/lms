from typing import List
from app.models.category import CategoryType
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_admin_or_instructor
from app.schemas.category import CategoryCreate, CategoryListResponse, CategoryUpdate, CategoryRead
from app.services.category import CategoryService

router = APIRouter()


@router.post(
    "/",
    response_model=CategoryRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_admin_or_instructor)],
)
async def create_category(
    category_in: CategoryCreate, db: AsyncSession = Depends(get_db)
):
    try:
        return await CategoryService.create_category(db, category_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/", response_model=CategoryListResponse)
async def read_categories(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    term: str | None = None,
    is_active: bool | None = None,
    type: CategoryType | None = None,
    db: AsyncSession = Depends(get_db),
):
    return await CategoryService.get_categories(
        db, page=page, size=size, term=term, is_active=is_active, type=type
    )


@router.get("/{category_id}", response_model=CategoryRead)
async def read_category(category_id: int, db: AsyncSession = Depends(get_db)):
    category = await CategoryService.get_category(db, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
        )
    return category


@router.put("/{category_id}", response_model=CategoryRead)
async def update_category(
    category_id: int, category_in: CategoryUpdate, db: AsyncSession = Depends(get_db)
):
    try:
        return await CategoryService.update_category(db, category_id, category_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: int, db: AsyncSession = Depends(get_db)):
    try:
        await CategoryService.delete_category(db, category_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
