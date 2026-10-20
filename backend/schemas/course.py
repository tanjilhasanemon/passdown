from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from schemas.common import normalize_optional_str


class CourseBase(BaseModel):
    code: str
    title: str
    department: str | None = None
    semester_offered: str | None = None

    @field_validator("code")
    @classmethod
    def validate_code(cls, value: str) -> str:
        cleaned = value.strip().upper()
        if len(cleaned) < 2 or len(cleaned) > 20:
            raise ValueError("Course code must be between 2 and 20 characters")
        return cleaned

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 3 or len(cleaned) > 200:
            raise ValueError("Course title must be between 3 and 200 characters")
        return cleaned

    @field_validator("department")
    @classmethod
    def validate_department(cls, value: str | None) -> str | None:
        return normalize_optional_str(value, 100, "Department")

    @field_validator("semester_offered")
    @classmethod
    def validate_semester(cls, value: str | None) -> str | None:
        return normalize_optional_str(value, 50, "Semester offered")


class CourseCreate(CourseBase):
    pass


class CourseUpdate(CourseBase):
    pass


class CourseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    title: str
    department: str | None = None
    semester_offered: str | None = None
    created_at: datetime
    updated_at: datetime