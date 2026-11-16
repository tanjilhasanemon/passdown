from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from core.audit import record_audit
from core.database import get_db
from schemas.auth import RegisterRequest, TokenResponse
from schemas.user import UserRead
from services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    data: RegisterRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> UserRead:
    user = AuthService.register(db, data)
    record_audit(
        db,
        action="register",
        user_id=user.id,
        user_email=user.email,
        details=f"Registered student account ({user.name})",
        request=request,
    )
    return UserRead.model_validate(user)


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login_user(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> TokenResponse:
    email = form_data.username.strip().lower()
    try:
        token_res = AuthService.login(db, email=email, password=form_data.password)
        from repositories.user import UserRepository

        u = UserRepository.get_by_email(db, email)
        record_audit(
            db,
            action="login",
            user_id=u.id if u else None,
            user_email=email,
            details=f"Signed in ({u.role})" if u else "Signed in",
            request=request,
        )
        return token_res
    except HTTPException as exc:
        action = "account_locked" if exc.status_code == 429 else "login_failed"
        record_audit(
            db,
            action=action,
            user_email=email or "unknown",
            details=str(exc.detail),
            request=request,
            is_security_event=True,
        )
        raise
