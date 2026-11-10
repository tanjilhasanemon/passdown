from pydantic import BaseModel, ConfigDict, field_validator

from schemas.user import validate_email_str, validate_password_strength, validate_user_name


class RegisterRequest(BaseModel):
    # Ignore any extra fields like "role" so a client can never escalate privileges (NFR-18, AC-15)
    model_config = ConfigDict(extra="ignore")

    name: str
    email: str
    password: str

    @field_validator("name")
    @classmethod
    def check_name(cls, value: str) -> str:
        return validate_user_name(value)

    @field_validator("email")
    @classmethod
    def check_email(cls, value: str) -> str:
        return validate_email_str(value)

    @field_validator("password")
    @classmethod
    def check_password(cls, value: str) -> str:
        return validate_password_strength(value)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
