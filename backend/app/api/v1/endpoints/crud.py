import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_admin_or_instructor
from app.schemas.crud import DeleteSchema, DeleteResponse
from app.services.crud import CrudService
from app.utils.string import get_model
from app.core.responses import error_response, success_response

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
    
    Args:
        model_name: Name of the model to delete from (e.g., 'Course', 'Lesson')
        payload: DeleteSchema containing model name and filter rules
        db: Database session
        current_user: Current authenticated user (admin or instructor)
        
    Returns:
        DeleteResponse with number of deleted records
        
    Raises:
        HTTPException: If model is invalid or deletion fails
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
        
        # Validate that model matches the payload
        if payload.model != payload.model:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Model name mismatch"
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
            deleted=deleted,
            status="success",
            message=message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting records from {payload.model}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete records"
        )
