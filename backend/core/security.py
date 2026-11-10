from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

from core.config import settings

# Argon2id is the default type in argon2-cffi PasswordHasher (NFR-12)
_password_hasher = PasswordHasher()

# All OAuth2 security scopes and descriptions (TDD §6.2 & §6.3)
SCOPE_DESCRIPTIONS: dict[str, str] = {
    "profile:read": "Read own user profile and dashboard data",
    "profile:write": "Update own display name and password",
    "contributions:write": "Submit, edit, and delete contributions",
    "requests:write": "Post, fulfill, and delete material requests",
    "courses:write": "Create, update, and delete courses",
    "materials:write": "Create, update, and delete core materials",
    "contributions:moderate": "Review, approve, and reject contributions",
    "stats:read": "Read platform-wide statistics",
    "users:manage": "List users and activate or deactivate accounts",
}

ROLE_SCOPES: dict[str, list[str]] = {
    "student": [
        "profile:read",
        "profile:write",
        "contributions:write",
        "requests:write",
    ],
    "admin": list(SCOPE_DESCRIPTIONS.keys()),
}


def get_scopes_for_role(role: str) -> list[str]:
    """Return the list of security scopes granted to a given user role."""
    return list(ROLE_SCOPES.get(role, ROLE_SCOPES["student"]))


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password using Argon2id."""
    return _password_hasher.hash(plain_password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    """Verify a plaintext password against an Argon2id hash."""
    try:
        return _password_hasher.verify(password_hash, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def create_access_token(
    user_id: int,
    role: str,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a signed HS256 JWT containing sub, role, scope, iat, and exp claims."""
    now = datetime.now(timezone.utc)
    expire = now + (
        expires_delta
        if expires_delta is not None
        else timedelta(minutes=settings.jwt_expire_minutes)
    )
    scopes = get_scopes_for_role(role)
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "role": role,
        "scope": " ".join(scopes),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate an HS256 JWT. Raises jwt.PyJWTError if invalid or expired."""
    return jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=[settings.jwt_algorithm],
    )
