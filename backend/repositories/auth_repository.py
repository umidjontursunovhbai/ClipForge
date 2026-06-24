from datetime import datetime, timezone

from sqlalchemy.orm import Session

from backend.database.models import AuthSessionRecord, UserRecord
from backend.services.password_service import hash_token


class AuthRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_user_by_username(self, username: str) -> UserRecord | None:
        return self.db.query(UserRecord).filter(UserRecord.username == username).first()

    def create_session(self, session: AuthSessionRecord) -> AuthSessionRecord:
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def get_user_by_token(self, token: str) -> UserRecord | None:
        token_digest = hash_token(token)
        session = (
            self.db.query(AuthSessionRecord)
            .filter(AuthSessionRecord.token_hash == token_digest)
            .filter(AuthSessionRecord.expires_at > datetime.now(timezone.utc))
            .first()
        )
        if session is None:
            return None
        return session.user
