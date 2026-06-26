from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.database.models import GeneratedAssetRecord, JobRecord


class JobRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, job: JobRecord) -> JobRecord:
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def get(self, job_id: str) -> JobRecord | None:
        return self.db.get(JobRecord, job_id)

    def save(self, job: JobRecord) -> JobRecord:
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def add_asset(self, asset: GeneratedAssetRecord) -> GeneratedAssetRecord:
        self.db.add(asset)
        self.db.commit()
        self.db.refresh(asset)
        return asset


    def list_assets_for_user(self, user_id: str) -> list[tuple[GeneratedAssetRecord, JobRecord]]:
        statement = (
            select(GeneratedAssetRecord, JobRecord)
            .join(JobRecord, GeneratedAssetRecord.job_id == JobRecord.id)
            .where(GeneratedAssetRecord.user_id == user_id)
            .order_by(GeneratedAssetRecord.created_at.desc())
        )
        return list(self.db.execute(statement).all())
