from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from models.course import Course
from schemas.course import CourseCreate, CourseUpdate


class CourseRepository:
    @staticmethod
    def list_courses(
        db: Session,
        q: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[Course], int]:
        stmt = select(Course)
        count_stmt = select(func.count()).select_from(Course)

        if q and q.strip():
            pattern = f"%{q.strip()}%"
            condition = or_(
                Course.code.ilike(pattern),
                Course.title.ilike(pattern),
            )
            stmt = stmt.where(condition)
            count_stmt = count_stmt.where(condition)

        total = db.scalar(count_stmt) or 0
        items = list(
            db.scalars(
                stmt.order_by(Course.code.asc()).limit(limit).offset(offset)
            ).all()
        )
        return items, total

    @staticmethod
    def get_by_id(db: Session, course_id: int) -> Course | None:
        return db.get(Course, course_id)

    @staticmethod
    def get_by_code(db: Session, code: str) -> Course | None:
        stmt = select(Course).where(Course.code == code.strip().upper())
        return db.scalar(stmt)

    @staticmethod
    def create(db: Session, data: CourseCreate) -> Course:
        course = Course(
            code=data.code,
            title=data.title,
            department=data.department,
            semester_offered=data.semester_offered,
        )
        db.add(course)
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def update(db: Session, course: Course, data: CourseUpdate) -> Course:
        course.code = data.code
        course.title = data.title
        course.department = data.department
        course.semester_offered = data.semester_offered
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def delete(db: Session, course: Course) -> None:
        db.delete(course)
        db.commit()