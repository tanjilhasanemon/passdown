from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from schemas.common import RequestStatus, normalize_optional_str


class MaterialRequestCreate(BaseModel):
    author_name: str
    title: str
    description: str | None = None

    @field_validator("author_name")
    @classmethod
    def validate_author_name(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 2 or len(cleaned) > 100:
            raise ValueError("Author name must be between 2 and 100 characters")
        return cleaned

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 5 or len(cleaned) > 200:
            raise ValueError("Request title must be between 5 and 200 characters")
        return cleaned

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str | None) -> str | None:
        return normalize_optional_str(value, 1000, "Description")


class MaterialRequestUpdate(BaseModel):
    author_name: str | None = None
    title: str
    description: str | None = None

    @field_validator("author_name")
    @classmethod
    def validate_author_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        if len(cleaned) < 2 or len(cleaned) > 100:
            raise ValueError("Author name must be between 2 and 100 characters")
        return cleaned

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 5 or len(cleaned) > 200:
            raise ValueError("Request title must be between 5 and 200 characters")
        return cleaned

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str | None) -> str | None:
        return normalize_optional_str(value, 1000, "Description")


class MaterialRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    course_id: int
    author_name: str
    title: str
    description: str | None = None
    status: RequestStatus
    created_at: datetime
    updated_at: datetime


RequestCreate = MaterialRequestCreate
RequestUpdate = MaterialRequestUpdate
RequestRead = MaterialRequestRead