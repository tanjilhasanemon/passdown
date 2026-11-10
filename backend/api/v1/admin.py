from fastapi import APIRouter, Depends, Query, Security
from sqlalchemy.orm import Session

from core.database import get_db
from dependencies.auth import get_current_user
from models.app_user import AppUser
from schemas.common import PaginatedResponse
from schemas.stats import PlatformStatsRead
from schemas.user import UserActiveUpdate, UserRead
from services.stats import StatsService
from services.user import UserService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", response_model=PlatformStatsRead)
def get_platform_stats(
    db: Session = Depends(get_db),
    _admin: AppUser = Security(get_current_user, scopes=["stats:read"]),
) -> PlatformStatsRead:
    return StatsService.get_platform_stats(db)


@router.get("/users", response_model=PaginatedResponse[UserRead])
def list_users(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _admin: AppUser = Security(get_current_user, scopes=["users:manage"]),
) -> PaginatedResponse[UserRead]:
    return UserService.list_users_for_admin(db, limit=limit, offset=offset)


@router.patch("/users/{user_id}/active", response_model=UserRead)
def update_user_active_status(
    user_id: int,
    data: UserActiveUpdate,
    db: Session = Depends(get_db),
    admin_user: AppUser = Security(get_current_user, scopes=["users:manage"]),
) -> UserRead:
    updated = UserService.set_user_active(
        db,
        target_user_id=user_id,
        data=data,
        admin_user=admin_user,
    )
    return UserRead.model_validate(updated)
