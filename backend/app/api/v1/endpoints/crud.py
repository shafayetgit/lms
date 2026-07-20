import logging
import re
from app.utils.string import get_model
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.api.deps import get_db, get_admin_or_instructor
from app.core.dependencies import has_permission
from app.schemas.crud import DeleteSchema, DeleteResponse
from app.services.crud import CrudService


logger = logging.getLogger(__name__)

router = APIRouter()


@router.delete("/delete")
async def delete_record(
    payload: DeleteSchema,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor),
) -> DeleteResponse:
    """
    Delete a record from the database.
    """
    try:
        # Get the model class
        model = get_model(payload.model)
        
        if model is None:
            logger.warning(f"Invalid model requested: {payload.model} by user {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid model: {payload.model}"
            )
        
        # Check permissions for the target model
        resource_name = payload.model.lower()
        if not await has_permission(current_user, db, resource_name, "delete"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="The user doesn't have enough privileges"
            )

        # Execute deletion
        deleted = await CrudService.delete(
            db,
            model,
            payload.filters,
        )
        
        logger.info(f"Deleted {deleted} records from {payload.model} by user {current_user.id}")
        
        message = f"Successfully deleted {deleted} record(s)" if deleted > 0 else "No records matched the criteria"
        
        return DeleteResponse(
            success=True,
            message=message
        )
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Value error deleting records from {payload.model}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except IntegrityError as e:
        error_msg = str(e)
        logger.error(f"Integrity error deleting records from {payload.model}: {error_msg}")
        
        # Try to extract the referencing table name from the PostgreSQL error message
        match = re.search(r'referenced from table "([^"]+)"', error_msg)
        if not match:
            # Fallback if the first regex doesn't match
            match2 = re.search(r'violates foreign key constraint.*?on table "([^"]+)"', error_msg)
            if match2:
                match = match2

        referenced_item = match.group(1).title() if match else "other"
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete this {payload.model} because it is referenced by {referenced_item} items."
        )
    except Exception as e:
        logger.error(f"Error deleting records from {payload.model}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete records"
        )
