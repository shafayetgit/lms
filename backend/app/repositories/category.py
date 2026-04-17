from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.category import Category


async def create_category(db: AsyncSession, category: Category) -> Category:
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


async def get_category_by_id(db: AsyncSession, category_id: int) -> Category | None:
    result = await db.execute(select(Category).where(Category.id == category_id))
    return result.scalars().first()


async def get_category_by_slug(db: AsyncSession, slug: str) -> Category | None:
    result = await db.execute(select(Category).where(Category.slug == slug))
    return result.scalars().first()


async def get_categories(
    db: AsyncSession, query: Select | None = None, skip: int = 0, limit: int = 10
) -> list[Category]:
    q = query if query is not None else select(Category)
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()


async def count_categories(db: AsyncSession, query: Select | None = None) -> int:
    q = query if query is not None else select(Category)
    return await db.scalar(select(func.count()).select_from(q.subquery()))


async def update_category(db: AsyncSession, category: Category) -> Category:
    await db.commit()
    await db.refresh(category)
    return category


async def delete_category(db: AsyncSession, category: Category) -> None:
    await db.delete(category)
    await db.commit()
