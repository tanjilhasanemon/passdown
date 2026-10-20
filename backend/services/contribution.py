from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.contribution import Contribution
from repositories.contribution import ContributionRepository
from schemas.common import PaginatedResponse
from schemas.contribution import (
    ContributionCreate,
    ContributionRead,
    ContributionStatusUpdate,
    ContributionUpdate,
)
from services.course import CourseService


class ContributionService:
    @staticmethod
    def list_approved_for_course(
        db: Session,
        course_id: int,
        material_type: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> PaginatedResponse[ContributionRead]:
        CourseService.get_course(db, course_id)
        items, total = ContributionRepository.list_approved_by_course(
            db,
            course_id=course_id,
            material_type=material_type,
            limit=limit,
            offset=offset,
        )
        return PaginatedResponse[ContributionRead](
            items=[ContributionRead.model_validate(item) for item in items],
            total=total,
            limit=limit,
            offset=offset,
        )

    @staticmethod
    def list_all_contributions(
        db: Session,
        status_filter: str | None = None,
        course_id: int | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> PaginatedResponse[ContributionRead]:
        items, total = ContributionRepository.list_all(
            db,
            status_filter=status_filter,
            course_id=course_id,
            limit=limit,
            offset=offset,
        )
        return PaginatedResponse[ContributionRead](
            items=[ContributionRead.model_validate(item) for item in items],
            total=total,
            limit=limit,
            offset=offset,
        )

    @staticmethod
    def get_contribution(db: Session, contribution_id: int) -> Contribution:
        contribution = ContributionRepository.get_by_id(db, contribution_id)
        if not contribution:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contribution not found",
            )
        return contribution

    @staticmethod
    def create_contribution(
        db: Session, course_id: int, data: ContributionCreate
    ) -> Contribution:
        CourseService.get_course(db, course_id)
        return ContributionRepository.create(db, course_id=course_id, data=data)

    @staticmethod
    def update_contribution(
        db: Session, contribution_id: int, data: ContributionUpdate
    ) -> Contribution:
        contribution = ContributionService.get_contribution(db, contribution_id)
        if contribution.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Only pending contributions can be edited",
            )
        return ContributionRepository.update(db, contribution=contribution, data=data)

    @staticmethod
    def update_contribution_status(
        db: Session, contribution_id: int, data: ContributionStatusUpdate
    ) -> Contribution:
        contribution = ContributionService.get_contribution(db, contribution_id)
        return ContributionRepository.update_status(
            db, contribution=contribution, new_status=data.status
        )

    @staticmethod
    def delete_contribution(db: Session, contribution_id: int) -> None:
        contribution = ContributionService.get_contribution(db, contribution_id)
        ContributionRepository.delete(db, contribution=contribution)