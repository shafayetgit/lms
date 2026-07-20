from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.category import Category
from app.repositories.base import BaseRepository


class CategoryRepository(BaseRepository[Category]):

    async def get_by_id(self, db: AsyncSession, id: int) -> Category | None:
        result = await db.execute(
            select(Category)
            .options(selectinload(Category.parent))
            .where(Category.id == id)
        )
        return result.scalars().first()

    async def get_by_public_id(self, db: AsyncSession, public_id: str) -> Category | None:
        result = await db.execute(
            select(Category)
            .options(selectinload(Category.parent))
            .where(Category.public_id == public_id)
        )
        return result.scalars().first()

    async def get_by_slug(self, db: AsyncSession, slug: str) -> Category | None:
        result = await db.execute(select(Category).where(Category.slug == slug))
        return result.scalars().first()

    async def get_categories(
        self, db: AsyncSession, query: Select | None = None, skip: int = 0, limit: int = 10
    ) -> list[Category]:
        q = query if query is not None else select(Category)
        q = q.options(selectinload(Category.parent))
        result = await db.execute(q.offset(skip).limit(limit))
        return result.scalars().all()

    async def count_categories(self, db: AsyncSession, query: Select | None = None) -> int:
        q = query if query is not None else select(Category)
        return await db.scalar(select(func.count()).select_from(q.subquery()))

    async def create_category(self, db: AsyncSession, category: Category) -> Category:
        db.add(category)
        await db.commit()
        return await self.get_by_id(db, category.id)

    async def update_category(self, db: AsyncSession, category: Category) -> Category:
        await db.commit()
        return await self.get_by_id(db, category.id)

    async def delete_category(self, db: AsyncSession, category: Category) -> None:
        await db.delete(category)
        await db.commit()

    async def get_category_choices(
        self, db: AsyncSession, query: Select | None = None
    ) -> list[dict]:
        """Get a list of categories for dropdown choices."""
        stmt = select(Category.public_id.label("value"), Category.name.label("label"))
        if query is not None:
            stmt = query
        result = await db.execute(stmt)
        return result.mappings().all()


category_repo = CategoryRepository(Category)


# Backward compatibility functions
async def create_category(db: AsyncSession, category: Category) -> Category:
    return await category_repo.create_category(db, category)


async def get_category_by_id(db: AsyncSession, category_id: int) -> Category | None:
    return await category_repo.get_by_id(db, category_id)


async def get_category_by_public_id(db: AsyncSession, public_id: str) -> Category | None:
    return await category_repo.get_by_public_id(db, public_id)


async def get_category_by_slug(db: AsyncSession, slug: str) -> Category | None:
    return await category_repo.get_by_slug(db, slug)


async def get_categories(
    db: AsyncSession, query: Select | None = None, skip: int = 0, limit: int = 10
) -> list[Category]:
    return await category_repo.get_categories(db, query, skip, limit)


async def count_categories(db: AsyncSession, query: Select | None = None) -> int:
    return await category_repo.count_categories(db, query)


async def update_category(db: AsyncSession, category: Category) -> Category:
    return await category_repo.update_category(db, category)


async def delete_category(db: AsyncSession, category: Category) -> None:
    await category_repo.delete_category(db, category)


async def get_category_choices(
    db: AsyncSession, query: Select | None = None
) -> list[dict]:
    return await category_repo.get_category_choices(db, query)
