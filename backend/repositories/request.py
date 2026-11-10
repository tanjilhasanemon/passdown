from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from models.app_user import AppUser
from models.request import MaterialRequest
from schemas.request import MaterialRequestCreate, MaterialRequestUpdate


class RequestRepository:
    @staticmethod
    def list_by_course(
        db: Session,
        course_id: int,
        status_filter: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[MaterialRequest], int]:
        filters = [MaterialRequest.course_id == course_id]
        if status_filter:
            filters.append(MaterialRequest.status == status_filter)

        count_stmt = select(func.count()).select_from(MaterialRequest).where(*filters)
        stmt = (
            select(MaterialRequest)
            .options(joinedload(MaterialRequest.course))
            .where(*filters)
            .order_by(MaterialRequest.created_at.desc(), MaterialRequest.id.desc())
            .limit(limit)
            .offset(offset)
        )

        total = db.scalar(count_stmt) or 0
        items = list(db.scalars(stmt).all())
        return items, total

    @staticmethod
    def list_by_author(
        db: Session,
        author_id: int,
        status_filter: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[MaterialRequest], int]:
        filters = [MaterialRequest.author_id == author_id]
        if status_filter:
            filters.append(MaterialRequest.status == status_filter)

        count_stmt = select(func.count()).select_from(MaterialRequest).where(*filters)
        stmt = (
            select(MaterialRequest)
            .options(joinedload(MaterialRequest.course))
            .where(*filters)
            .order_by(MaterialRequest.created_at.desc(), MaterialRequest.id.desc())
            .limit(limit)
            .offset(offset)
        )

        total = db.scalar(count_stmt) or 0
        items = list(db.scalars(stmt).all())
        return items, total

    @staticmethod
    def get_by_id(db: Session, request_id: int) -> MaterialRequest | None:
        stmt = (
            select(MaterialRequest)
            .options(joinedload(MaterialRequest.course))
            .where(MaterialRequest.id == request_id)
        )
        return db.scalar(stmt)

    @staticmethod
    def create(
        db: Session,
        course_id: int,
        data: MaterialRequestCreate,
        author: AppUser,
    ) -> MaterialRequest:
        material_request = MaterialRequest(
            course_id=course_id,
            author_id=author.id,
            author_name=author.name,
            title=data.title,
            description=data.description,
            status="open",
        )
        db.add(material_request)
        db.commit()
        db.refresh(material_request)
        return RequestRepository.get_by_id(db, material_request.id) or material_request

    @staticmethod
    def update(
        db: Session,
        material_request: MaterialRequest,
        data: MaterialRequestUpdate,
    ) -> MaterialRequest:
        material_request.title = data.title
        material_request.description = data.description
        db.commit()
        db.refresh(material_request)
        return RequestRepository.get_by_id(db, material_request.id) or material_request

    @staticmethod
    def mark_fulfilled(
        db: Session, material_request: MaterialRequest
    ) -> MaterialRequest:
        material_request.status = "fulfilled"
        db.commit()
        db.refresh(material_request)
        return RequestRepository.get_by_id(db, material_request.id) or material_request

    @staticmethod
    def delete(db: Session, material_request: MaterialRequest) -> None:
        db.delete(material_request)
        db.commit()
