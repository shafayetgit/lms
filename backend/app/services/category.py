import math
from typing import Optional, List
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.category import Category, CategoryBadge
from app.repositories import category as category_repo
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.utils.string import slugify


class CategoryService:
    @staticmethod
    async def create_category(
        db: AsyncSession, category_in: CategoryCreate
    ) -> Category:
        slug = category_in.slug or slugify(category_in.name)

        existing_slug = await category_repo.get_category_by_slug(db, slug)
        if existing_slug:
            raise ValueError(f"Category with slug '{slug}' already exists")

        parent_id = category_in.parent_id
        if parent_id is not None:
            if parent_id <= 0:
                parent_id = None
            else:
                parent = await category_repo.get_category_by_id(db, parent_id)
                if not parent:
                    raise ValueError(
                        f"Parent category with id {parent_id} does not exist"
                    )

        db_category = Category(
            name=category_in.name,
            parent_id=parent_id,
            slug=slug,
            description=category_in.description,
            is_active=category_in.is_active,
            badge=category_in.badge,
            thumbnail=category_in.thumbnail,
        )
        return {"data": await category_repo.create_category(db, db_category)}

    @staticmethod
    async def get_category(db: AsyncSession, category_id: int) -> dict | None:
        category = await category_repo.get_category_by_id(db, category_id)
        if not category:
            return None
        return {"data": category}

    @staticmethod
    async def get_categories(
        db: AsyncSession,
        page: int = 1,
        size: int = 10,
        term: str | None = None,
        is_active: bool | None = None,
        badge: CategoryBadge | None = None,
    ) -> dict:
        query = select(Category).order_by(desc(Category.id))

        if term:
            query = query.where(Category.name.ilike(f"%{term}%"))
        if is_active is not None:
            query = query.where(Category.is_active == is_active)
        if badge is not None:
            query = query.where(Category.badge == badge)

        skip = (page - 1) * size
        total = await category_repo.count_categories(db, query=query)
        data = await category_repo.get_categories(
            db, query=query, skip=skip, limit=size
        )
        total_pages = math.ceil(total / size) if total else 0

        return {
            "data": data,
            "meta": {
                "total": total,
                "page": page,
                "size": size,
                "pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1,
            },
        }

    @staticmethod
    async def update_category(
        db: AsyncSession, category_id: int, category_in: CategoryUpdate
    ) -> Category:
        category = await category_repo.get_category_by_id(db, category_id)
        if not category:
            raise ValueError("Category not found")

        update_data = category_in.model_dump(exclude_unset=True)

        if "name" in update_data and "slug" not in update_data:
            update_data["slug"] = slugify(update_data["name"])

        if "slug" in update_data and update_data["slug"] != category.slug:
            existing_slug = await category_repo.get_category_by_slug(
                db, update_data["slug"]
            )
            if existing_slug:
                raise ValueError(
                    f"Category with slug '{update_data['slug']}' already exists"
                )

        if "parent_id" in update_data:
            if update_data["parent_id"] is not None:
                if update_data["parent_id"] <= 0:
                    update_data["parent_id"] = None
                else:
                    parent = await category_repo.get_category_by_id(
                        db, update_data["parent_id"]
                    )
                    if not parent:
                        raise ValueError(
                            f"Parent category with id {update_data['parent_id']} does not exist"
                        )

        for field, value in update_data.items():
            setattr(category, field, value)

        return {"data": await category_repo.update_category(db, category)}

    @staticmethod
    async def delete_category(db: AsyncSession, category_id: int) -> None:
        category = await category_repo.get_category_by_id(db, category_id)
        if not category:
            raise ValueError("Category not found")
        await category_repo.delete_category(db, category)
