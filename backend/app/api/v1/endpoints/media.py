from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.media import MediaAttach, MediaRead
from app.services.media import MediaService
from app.models import Category, Course, Lesson, Module, User, Quiz

# Map model names to their classes
MODEL_MAP = {
    "Category": Category,
    "Course": Course,
    "Lesson": Lesson,
    "Module": Module,
    "User": User,
    "Quiz": Quiz,
}

router = APIRouter()


@router.post(
    "/attach",
    response_model=List[MediaRead],
    status_code=status.HTTP_201_CREATED,
)
async def attach_media_to_models(
    payload: List[MediaAttach],
    db: AsyncSession = Depends(get_db),
):
    """
    Attach media to model instances.
    
    Accepts a list of media payloads with field, model, model_id, and metadata.
    For each item, creates a media record and updates the target model's field.
    
    Example payload:
    [
        {
            "field": "thumbnail",
            "model": "Category",
            "model_id": 7,
            "meta": {
                "public_id": "uploads/...",
                "secure_url": "https://res.cloudinary.com/...",
                "width": 720,
                "height": 720,
                ...
            }
        }
    ]
    """
    created_media = []
    
    try:
        for media_item in payload:
            # Get the model class from the map
            model_class = MODEL_MAP.get(media_item.model)
            
            if not model_class:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Unknown model: {media_item.model}. Supported models: {', '.join(MODEL_MAP.keys())}",
                )
            
            # Attach media to the model
            media = await MediaService.attach_media_to_model(
                db=db,
                media_payload=media_item,
                model_class=model_class,
            )
            
            created_media.append(media)
        
        return created_media
    
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error attaching media: {str(e)}",
        )
