from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from backend.database.models import UserRecord
from backend.database.session import get_db
from backend.repositories.auth_repository import AuthRepository

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> UserRecord:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Missing auth token")

    user = AuthRepository(db).get_user_by_token(credentials.credentials)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired auth token")
    return user
