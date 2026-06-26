from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session

from backend.api.dependencies import get_current_user
from backend.api.schemas.generation_schemas import GeneratedAssetResponse, GenerationJobResponse, GeneratePreviewRequest
from backend.database.models import UserRecord
from backend.database.session import get_db
from backend.repositories.job_repository import JobRepository
from backend.repositories.template_repository import TemplateRepository
from backend.services.generation_service import GenerationService
from backend.workers.generation_worker import run_generation_job

router = APIRouter(prefix="/generation", tags=["generation"])


@router.post("/preview", response_model=GenerationJobResponse)
def create_preview_job(
    payload: GeneratePreviewRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: UserRecord = Depends(get_current_user),
) -> GenerationJobResponse:
    job = GenerationService(JobRepository(db), TemplateRepository(db)).create_preview_job(payload, user)
    background_tasks.add_task(run_generation_job, job.id)
    return job


@router.get("/library", response_model=list[GeneratedAssetResponse])
def list_generated_assets(
    db: Session = Depends(get_db),
    user: UserRecord = Depends(get_current_user),
) -> list[GeneratedAssetResponse]:
    rows = JobRepository(db).list_assets_for_user(user.id)
    return [
        GeneratedAssetResponse(
            id=asset.id,
            job_id=asset.job_id,
            template_id=asset.template_id,
            script=job.script,
            public_url=asset.public_url,
            media_type=asset.media_type,
            created_at=asset.created_at.isoformat(),
        )
        for asset, job in rows
    ]


@router.get("/jobs/{job_id}", response_model=GenerationJobResponse)
def get_generation_job(
    job_id: str,
    db: Session = Depends(get_db),
    user: UserRecord = Depends(get_current_user),
) -> GenerationJobResponse:
    return GenerationService(JobRepository(db), TemplateRepository(db)).get_job(job_id, user)
