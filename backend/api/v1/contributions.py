from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from core.database import get_db
from schemas.common import ContributionStatus, MaterialType, PaginatedResponse
from schemas.contribution import (
    ContributionCreate,
    ContributionRead,
    ContributionStatusUpdate,
    ContributionUpdate,
)
from services.contribution import ContributionService

router = APIRouter(tags=["Contributions"])


@router.get(
    "/courses/{course_id}/contributions",
    response_model=PaginatedResponse[ContributionRead],
)
def list_course_contributions(
    course_id: int,
    type: MaterialType | None = Query(
        default=None,
        description="Filter approved contributions by material type",
    ),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> PaginatedResponse[ContributionRead]:
    return ContributionService.list_approved_for_course(
        db,
        course_id=course_id,
        material_type=type,
        limit=limit,
        offset=offset,
    )


@router.post(
    "/courses/{course_id}/contributions",
    response_model=ContributionRead,
    status_code=status.HTTP_201_CREATED,
)
def create_contribution(
    course_id: int,
    data: ContributionCreate,
    db: Session = Depends(get_db),
) -> ContributionRead:
    contribution = ContributionService.create_contribution(
        db, course_id=course_id, data=data
    )
    return ContributionRead.model_validate(contribution)


@router.get(
    "/contributions",
    response_model=PaginatedResponse[ContributionRead],
)
def list_all_contributions(
    status: ContributionStatus | None = Query(
        default=None,
        description="Filter contributions across all courses by status (pending, approved, rejected)",
    ),
    course_id: int | None = Query(
        default=None,
        description="Filter contributions by course ID",
    ),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> PaginatedResponse[ContributionRead]:
    return ContributionService.list_all_contributions(
        db,
        status_filter=status,
        course_id=course_id,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/contributions/{contribution_id}",
    response_model=ContributionRead,
)
def get_contribution(
    contribution_id: int,
    db: Session = Depends(get_db),
) -> ContributionRead:
    contribution = ContributionService.get_contribution(db, contribution_id)
    return ContributionRead.model_validate(contribution)


@router.put(
    "/contributions/{contribution_id}",
    response_model=ContributionRead,
)
def update_contribution(
    contribution_id: int,
    data: ContributionUpdate,
    db: Session = Depends(get_db),
) -> ContributionRead:
    contribution = ContributionService.update_contribution(
        db, contribution_id=contribution_id, data=data
    )
    return ContributionRead.model_validate(contribution)


@router.patch(
    "/contributions/{contribution_id}/status",
    response_model=ContributionRead,
)
def update_contribution_status(
    contribution_id: int,
    data: ContributionStatusUpdate,
    db: Session = Depends(get_db),
) -> ContributionRead:
    contribution = ContributionService.update_contribution_status(
        db, contribution_id=contribution_id, data=data
    )
    return ContributionRead.model_validate(contribution)


@router.delete(
    "/contributions/{contribution_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_contribution(
    contribution_id: int,
    db: Session = Depends(get_db),
) -> Response:
    ContributionService.delete_contribution(db, contribution_id=contribution_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)