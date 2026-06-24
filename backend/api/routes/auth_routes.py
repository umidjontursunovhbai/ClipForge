from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.api.dependencies import get_current_user
from backend.api.schemas.auth_schemas import CurrentUserResponse, LoginRequest, LoginResponse
from backend.database.models import UserRecord
from backend.database.session import get_db
from backend.repositories.auth_repository import AuthRepository
from backend.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    return AuthService(AuthRepository(db)).login(payload)


@router.get("/me", response_model=CurrentUserResponse)
def current_user(user: UserRecord = Depends(get_current_user)) -> CurrentUserResponse:
    return CurrentUserResponse(id=user.id, username=user.username, role=user.role)
