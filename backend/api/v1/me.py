from fastapi import APIRouter, Depends, Query, Response, Security, status
from sqlalchemy.orm import Session

from core.database import get_db
from dependencies.auth import get_current_user
from models.app_user import AppUser
from schemas.common import ContributionStatus, PaginatedResponse, RequestStatus
from schemas.contribution import ContributionRead
from schemas.request import MaterialRequestRead
from schemas.stats import UserSummaryRead
from schemas.user import UserPasswordUpdate, UserProfileUpdate, UserRead
from services.stats import StatsService
from services.user import UserService

router = APIRouter(prefix="/me", tags=["Profile & Dashboard"])


@router.get("", response_model=UserRead)
def get_my_profile(
    current_user: AppUser = Security(get_current_user, scopes=["profile:read"]),
) -> UserRead:
    return UserRead.model_validate(current_user)


@router.patch("", response_model=UserRead)
def update_my_profile(
    data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: AppUser = Security(get_current_user, scopes=["profile:write"]),
) -> UserRead:
    updated = UserService.update_profile(db, current_user=current_user, data=data)
    return UserRead.model_validate(updated)


@router.post("/password", status_code=status.HTTP_204_NO_CONTENT)
def change_my_password(
    data: UserPasswordUpdate,
    db: Session = Depends(get_db),
    current_user: AppUser = Security(get_current_user, scopes=["profile:write"]),
) -> Response:
    UserService.change_password(db, current_user=current_user, data=data)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/summary", response_model=UserSummaryRead)
def get_my_summary(
    db: Session = Depends(get_db),
    current_user: AppUser = Security(get_current_user, scopes=["profile:read"]),
) -> UserSummaryRead:
    return StatsService.get_my_summary(db, current_user=current_user)


@router.get(
    "/contributions",
    response_model=PaginatedResponse[ContributionRead],
)
def list_my_contributions(
    status: ContributionStatus | None = Query(
        default=None,
        description="Filter own contributions by status (pending, approved, rejected)",
    ),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: AppUser = Security(get_current_user, scopes=["profile:read"]),
) -> PaginatedResponse[ContributionRead]:
    return UserService.list_my_contributions(
        db,
        current_user=current_user,
        status_filter=status,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/requests",
    response_model=PaginatedResponse[MaterialRequestRead],
)
def list_my_requests(
    status: RequestStatus | None = Query(
        default=None,
        description="Filter own requests by status (open, fulfilled)",
    ),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: AppUser = Security(get_current_user, scopes=["profile:read"]),
) -> PaginatedResponse[MaterialRequestRead]:
    return UserService.list_my_requests(
        db,
        current_user=current_user,
        status_filter=status,
        limit=limit,
        offset=offset,
    )
