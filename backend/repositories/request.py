from sqlalchemy import func, select
from sqlalchemy.orm import Session

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
        return db.get(MaterialRequest, request_id)

    @staticmethod
    def create(
        db: Session, course_id: int, data: MaterialRequestCreate
    ) -> MaterialRequest:
        material_request = MaterialRequest(
            course_id=course_id,
            author_name=data.author_name,
            title=data.title,
            description=data.description,
            status="open",
        )
        db.add(material_request)
        db.commit()
        db.refresh(material_request)
        return material_request

    @staticmethod
    def update(
        db: Session,
        material_request: MaterialRequest,
        data: MaterialRequestUpdate,
    ) -> MaterialRequest:
        if data.author_name is not None:
            material_request.author_name = data.author_name
        material_request.title = data.title
        material_request.description = data.description
        db.commit()
        db.refresh(material_request)
        return material_request

    @staticmethod
    def mark_fulfilled(
        db: Session, material_request: MaterialRequest
    ) -> MaterialRequest:
        material_request.status = "fulfilled"
        db.commit()
        db.refresh(material_request)
        return material_request

    @staticmethod
    def delete(db: Session, material_request: MaterialRequest) -> None:
        db.delete(material_request)
        db.commit()