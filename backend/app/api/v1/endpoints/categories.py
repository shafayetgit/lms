
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.core.dependencies import PermissionChecker
from app.models.category import CategoryBadge
from app.schemas.category import (
    CategoryCreate,
    CategoryListResponse,
    CategoryReadResponse,
    CategoryUpdate,
)
from app.services.category import CategoryService

router = APIRouter()


@router.post(
    "/",
    response_model=CategoryReadResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(PermissionChecker("category", "create"))],
)
async def create_category(
    category_in: CategoryCreate, db: AsyncSession = Depends(get_db)
):
    try:
        data = await CategoryService.create_category(db, category_in)
        return {
            "success": True,
            "data": data,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/",
    response_model=CategoryListResponse,
)
async def read_categories(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    term: str | None = None,
    is_active: bool | None = None,
    badge: CategoryBadge | None = None,
    is_portal: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("category", "read")),
):
    if is_portal and is_active is None:
        is_active = True

    owner_id = (
        current_user.id
        if current_user and getattr(current_user, "_requires_creator_check", False)
        else None
    )
    data = await CategoryService.get_categories(
        db, page=page, size=size, term=term, is_active=is_active, badge=badge, owner_id=owner_id
    )

    return data


@router.get(
    "/{public_id}",
    response_model=CategoryReadResponse,
    dependencies=[Depends(PermissionChecker("category", "read"))],
)
async def read_category(public_id: str, db: AsyncSession = Depends(get_db)):
    category = await CategoryService.get_category(db, public_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found"
        )

    return {
        "success": True,
        "data": category,
    }


@router.put(
    "/{public_id}",
    response_model=CategoryReadResponse,
    dependencies=[Depends(PermissionChecker("category", "update"))],
)
async def update_category(
    public_id: str, category_in: CategoryUpdate, db: AsyncSession = Depends(get_db)
):
    try:
        data = await CategoryService.update_category(db, public_id, category_in)
        return {
            "success": True,
            "data": data,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete(
    "/{public_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(PermissionChecker("category", "delete"))],
)
async def delete_category(
    public_id: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        await CategoryService.delete_category(db, public_id)
        return {
            "success": True,
            "message": "Successfully deleted",
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

