from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from core.database import get_db
from schemas.common import PaginatedResponse
from schemas.course import CourseCreate, CourseRead, CourseUpdate
from services.course import CourseService

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("", response_model=PaginatedResponse[CourseRead])
def list_courses(
    q: str | None = Query(
        default=None,
        description="Search courses by code or title (case-insensitive)",
    ),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> PaginatedResponse[CourseRead]:
    return CourseService.list_courses(db, q=q, limit=limit, offset=offset)


@router.get("/{course_id}", response_model=CourseRead)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
) -> CourseRead:
    course = CourseService.get_course(db, course_id)
    return CourseRead.model_validate(course)


@router.post("", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
def create_course(
    data: CourseCreate,
    db: Session = Depends(get_db),
) -> CourseRead:
    course = CourseService.create_course(db, data)
    return CourseRead.model_validate(course)


@router.put("/{course_id}", response_model=CourseRead)
def update_course(
    course_id: int,
    data: CourseUpdate,
    db: Session = Depends(get_db),
) -> CourseRead:
    course = CourseService.update_course(db, course_id, data)
    return CourseRead.model_validate(course)


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
) -> Response:
    CourseService.delete_course(db, course_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)