from app.models.ai_source_content import AISourceContent
from app.repositories.base import BaseRepository


class AISourceContentRepository(BaseRepository[AISourceContent]):
    pass


ai_source_content_repo = AISourceContentRepository(AISourceContent)
