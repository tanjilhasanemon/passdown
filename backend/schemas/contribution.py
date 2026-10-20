from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from schemas.common import (
    ContributionStatus,
    MaterialType,
    ModerationStatus,
    normalize_optional_str,
    validate_http_url,
)


class ContributionCreate(BaseModel):
    author_name: str
    title: str
    type: MaterialType
    url: str
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
        if len(cleaned) < 3 or len(cleaned) > 200:
            raise ValueError("Contribution title must be between 3 and 200 characters")
        return cleaned

    @field_validator("url")
    @classmethod
    def validate_url(cls, value: str) -> str:
        return validate_http_url(value)

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str | None) -> str | None:
        return normalize_optional_str(value, 1000, "Description")


class ContributionUpdate(BaseModel):
    author_name: str | None = None
    title: str
    type: MaterialType
    url: str
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
        if len(cleaned) < 3 or len(cleaned) > 200:
            raise ValueError("Contribution title must be between 3 and 200 characters")
        return cleaned

    @field_validator("url")
    @classmethod
    def validate_url(cls, value: str) -> str:
        return validate_http_url(value)

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str | None) -> str | None:
        return normalize_optional_str(value, 1000, "Description")


class ContributionStatusUpdate(BaseModel):
    status: ModerationStatus


class ContributionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    course_id: int
    course_code: str | None = None
    course_title: str | None = None
    author_name: str
    title: str
    type: MaterialType
    url: str
    description: str | None = None
    status: ContributionStatus
    created_at: datetime
    updated_at: datetime