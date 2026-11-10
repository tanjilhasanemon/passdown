from sqlalchemy.orm import Session

from models.app_user import AppUser
from repositories.stats import StatsRepository
from schemas.stats import PlatformStatsRead, UserSummaryRead


class StatsService:
    @staticmethod
    def get_my_summary(db: Session, current_user: AppUser) -> UserSummaryRead:
        return StatsRepository.get_user_summary(db, user_id=current_user.id)

    @staticmethod
    def get_platform_stats(db: Session) -> PlatformStatsRead:
        return StatsRepository.get_platform_stats(db)
