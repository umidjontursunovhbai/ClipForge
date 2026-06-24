import secrets
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import HTTPException

from backend.api.schemas.auth_schemas import LoginRequest, LoginResponse
from backend.core.config import settings
from backend.database.models import AuthSessionRecord
from backend.repositories.auth_repository import AuthRepository
from backend.services.password_service import hash_token, verify_password


class AuthService:
    def __init__(self, repository: AuthRepository) -> None:
        self.repository = repository

    def login(self, payload: LoginRequest) -> LoginResponse:
        user = self.repository.get_user_by_username(payload.username)
        if user is None or not verify_password(payload.password, user.password_hash, user.password_salt):
            raise HTTPException(status_code=401, detail="Invalid username or password")

        token = secrets.token_urlsafe(36)
        self.repository.create_session(
            AuthSessionRecord(
                id=f"session_{uuid4().hex}",
                user_id=user.id,
                token_hash=hash_token(token),
                expires_at=datetime.now(timezone.utc) + timedelta(hours=settings.session_ttl_hours),
            )
        )
        return LoginResponse(token=token, username=user.username, role=user.role)
