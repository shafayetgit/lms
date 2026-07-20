from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Sequence

from app.models.live_class import LiveClass
from app.models.course import Course
from app.models.batch import Batch
from app.schemas.live_class import LiveClassCreate, LiveClassUpdate
from app.repositories import live_class as live_class_repo
from app.repositories import user as user_repo

async def schedule_class(db: AsyncSession, class_in: LiveClassCreate) -> LiveClass:
    # Ensure it's bound to either a batch or a course (or both, though usually one)
    if not class_in.batch_id and not class_in.course_id:
        raise HTTPException(status_code=400, detail="Live class must be bound to a course or a batch")
        
    host = await user_repo.get_user_by_id(db, class_in.host_id)
    if not host:
        raise HTTPException(status_code=404, detail="Host user not found")
        
    # We could also verify batch and course existence here, but FK handles hard constraints
    
    live_class = LiveClass(**class_in.model_dump())
    return await live_class_repo.create_live_class(db, live_class)

async def update_class(
    db: AsyncSession, live_class: LiveClass, update_in: LiveClassUpdate
) -> LiveClass:
    update_data = update_in.model_dump(exclude_unset=True)
    
    if "host_id" in update_data and update_data["host_id"] != live_class.host_id:
        host = await user_repo.get_user_by_id(db, update_data["host_id"])
        if not host:
            raise HTTPException(status_code=404, detail="Host user not found")
            
    for field, value in update_data.items():
        setattr(live_class, field, value)
        
    return await live_class_repo.update_live_class(db, live_class)

# Student schedule is a bit more complex (fetching courses/batches they are enrolled in)
# For now, we will expose the primitive get_live_classes and let endpoints orchestrate if needed.
