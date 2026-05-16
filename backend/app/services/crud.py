from app.shared.crud import build_conditions
from sqlalchemy import delete


class CrudService:
    @staticmethod
    async def delete(
        db,
        model,
        filters,
    ):

        conditions = build_conditions(
            model,
            filters,
        )

        stmt = delete(model).where(*conditions)

        result = await db.execute(stmt)

        await db.commit()

        return result.rowcount
