from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from schemas.common import MaterialType, normalize_optional_str, validate_http_url


class CoreMaterialBase(BaseModel):
    title: str
    type: MaterialType
    url: str
    description: str | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 3 or len(cleaned) > 200:
            raise ValueError("Material title must be between 3 and 200 characters")
        return cleaned

    @field_validator("url")
    @classmethod
    def validate_url(cls, value: str) -> str:
        return validate_http_url(value)

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str | None) -> str | None:
        return normalize_optional_str(value, 1000, "Description")


class CoreMaterialCreate(CoreMaterialBase):
    pass


class CoreMaterialUpdate(CoreMaterialBase):
    pass


class CoreMaterialRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    course_id: int
    title: str
    type: MaterialType
    url: str
    description: str | None = None
    created_at: datetime
    updated_at: datetime