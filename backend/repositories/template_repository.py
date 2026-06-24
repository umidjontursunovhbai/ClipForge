from sqlalchemy.orm import Session

from backend.database.models import TemplateRecord


class TemplateRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self) -> list[TemplateRecord]:
        return self.db.query(TemplateRecord).order_by(TemplateRecord.created_at.asc(), TemplateRecord.id.asc()).all()

    def get(self, template_id: str) -> TemplateRecord | None:
        return self.db.get(TemplateRecord, template_id)
