from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.request import MaterialRequest
from repositories.request import RequestRepository
from schemas.common import PaginatedResponse
from schemas.request import (
    MaterialRequestCreate,
    MaterialRequestRead,
    MaterialRequestUpdate,
)
from services.course import CourseService


class RequestService:
    @staticmethod
    def list_course_requests(
        db: Session,
        course_id: int,
        status_filter: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> PaginatedResponse[MaterialRequestRead]:
        CourseService.get_course(db, course_id)
        items, total = RequestRepository.list_by_course(
            db,
            course_id=course_id,
            status_filter=status_filter,
            limit=limit,
            offset=offset,
        )
        return PaginatedResponse[MaterialRequestRead](
            items=[MaterialRequestRead.model_validate(item) for item in items],
            total=total,
            limit=limit,
            offset=offset,
        )

    @staticmethod
    def get_request(db: Session, request_id: int) -> MaterialRequest:
        material_request = RequestRepository.get_by_id(db, request_id)
        if not material_request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request not found",
            )
        return material_request

    @staticmethod
    def create_request(
        db: Session, course_id: int, data: MaterialRequestCreate
    ) -> MaterialRequest:
        CourseService.get_course(db, course_id)
        return RequestRepository.create(db, course_id=course_id, data=data)

    @staticmethod
    def update_request(
        db: Session, request_id: int, data: MaterialRequestUpdate
    ) -> MaterialRequest:
        material_request = RequestService.get_request(db, request_id)
        return RequestRepository.update(
            db, material_request=material_request, data=data
        )

    @staticmethod
    def fulfill_request(db: Session, request_id: int) -> MaterialRequest:
        material_request = RequestService.get_request(db, request_id)
        return RequestRepository.mark_fulfilled(db, material_request=material_request)

    @staticmethod
    def delete_request(db: Session, request_id: int) -> None:
        material_request = RequestService.get_request(db, request_id)
        RequestRepository.delete(db, material_request=material_request)