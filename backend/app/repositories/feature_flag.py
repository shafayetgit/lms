from app.models.feature_flag import FeatureFlag
from app.repositories.base import BaseRepository


class FeatureFlagRepository(BaseRepository[FeatureFlag]):
    pass


feature_flag_repo = FeatureFlagRepository(FeatureFlag)
