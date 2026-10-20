from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from models.contribution import Contribution
from schemas.contribution import ContributionCreate, ContributionUpdate


class ContributionRepository:
    @staticmethod
    def list_approved_by_course(
        db: Session,
        course_id: int,
        material_type: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[Contribution], int]:
        base_filter = [
            Contribution.course_id == course_id,
            Contribution.status == "approved",
        ]
        if material_type:
            base_filter.append(Contribution.type == material_type)

        count_stmt = select(func.count()).select_from(Contribution).where(*base_filter)
        stmt = (
            select(Contribution)
            .options(joinedload(Contribution.course))
            .where(*base_filter)
            .order_by(Contribution.created_at.desc(), Contribution.id.desc())
            .limit(limit)
            .offset(offset)
        )

        total = db.scalar(count_stmt) or 0
        items = list(db.scalars(stmt).all())
        return items, total

    @staticmethod
    def list_all(
        db: Session,
        status_filter: str | None = None,
        course_id: int | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[Contribution], int]:
        filters = []
        if status_filter:
            filters.append(Contribution.status == status_filter)
        if course_id is not None:
            filters.append(Contribution.course_id == course_id)

        count_stmt = select(func.count()).select_from(Contribution)
        stmt = select(Contribution).options(joinedload(Contribution.course))

        if filters:
            count_stmt = count_stmt.where(*filters)
            stmt = stmt.where(*filters)

        total = db.scalar(count_stmt) or 0
        items = list(
            db.scalars(
                stmt.order_by(Contribution.created_at.desc(), Contribution.id.desc())
                .limit(limit)
                .offset(offset)
            ).all()
        )
        return items, total

    @staticmethod
    def get_by_id(db: Session, contribution_id: int) -> Contribution | None:
        stmt = (
            select(Contribution)
            .options(joinedload(Contribution.course))
            .where(Contribution.id == contribution_id)
        )
        return db.scalar(stmt)

    @staticmethod
    def create(db: Session, course_id: int, data: ContributionCreate) -> Contribution:
        contribution = Contribution(
            course_id=course_id,
            author_name=data.author_name,
            title=data.title,
            type=data.type,
            url=data.url,
            description=data.description,
            status="pending",
        )
        db.add(contribution)
        db.commit()
        db.refresh(contribution)
        return ContributionRepository.get_by_id(db, contribution.id) or contribution

    @staticmethod
    def update(
        db: Session, contribution: Contribution, data: ContributionUpdate
    ) -> Contribution:
        if data.author_name is not None:
            contribution.author_name = data.author_name
        contribution.title = data.title
        contribution.type = data.type
        contribution.url = data.url
        contribution.description = data.description
        db.commit()
        db.refresh(contribution)
        return ContributionRepository.get_by_id(db, contribution.id) or contribution

    @staticmethod
    def update_status(
        db: Session, contribution: Contribution, new_status: str
    ) -> Contribution:
        contribution.status = new_status
        db.commit()
        db.refresh(contribution)
        return ContributionRepository.get_by_id(db, contribution.id) or contribution

    @staticmethod
    def delete(db: Session, contribution: Contribution) -> None:
        db.delete(contribution)
        db.commit()