from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.api.dependencies import get_current_user
from backend.api.schemas.template_schemas import TemplateResponse, TemplateTranscriptionResponse, TranscriptionJobResponse
from backend.database.models import JobRecord, UserRecord
from backend.database.session import get_db
from backend.repositories.job_repository import JobRepository
from backend.repositories.template_repository import TemplateRepository
from backend.services.job_response_service import transcription_job_to_response
from backend.services.template_service import TemplateService
from backend.services.transcription_service import LocalWhisperTranscriptionService
from backend.workers.transcription_worker import run_transcription_job

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("", response_model=list[TemplateResponse])
def list_templates(
    db: Session = Depends(get_db),
    _: UserRecord = Depends(get_current_user),
) -> list[TemplateResponse]:
    return TemplateService(repository=TemplateRepository(db)).list_templates()


@router.get("/{template_id}", response_model=TemplateResponse)
def get_template(
    template_id: str,
    db: Session = Depends(get_db),
    _: UserRecord = Depends(get_current_user),
) -> TemplateResponse:
    return TemplateService(repository=TemplateRepository(db)).get_template(template_id)


@router.post("/{template_id}/transcription", response_model=TemplateTranscriptionResponse)
def transcribe_template(
    template_id: str,
    db: Session = Depends(get_db),
    _: UserRecord = Depends(get_current_user),
) -> TemplateTranscriptionResponse:
    return LocalWhisperTranscriptionService(repository=TemplateRepository(db)).transcribe_template(template_id)


@router.post("/{template_id}/transcription/jobs", response_model=TranscriptionJobResponse)
def create_transcription_job(
    template_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: UserRecord = Depends(get_current_user),
) -> TranscriptionJobResponse:
    if TemplateRepository(db).get(template_id) is None:
        raise HTTPException(status_code=404, detail="Template not found")

    job = JobRepository(db).create(
        JobRecord(
            id=f"tr_{uuid4().hex}",
            job_type="transcription",
            user_id=user.id,
            template_id=template_id,
            status="queued",
            progress=0,
            script="",
            language="",
            voice="",
        )
    )
    background_tasks.add_task(run_transcription_job, job.id)
    return transcription_job_to_response(job)


@router.get("/transcription/jobs/{job_id}", response_model=TranscriptionJobResponse)
def get_transcription_job(
    job_id: str,
    db: Session = Depends(get_db),
    user: UserRecord = Depends(get_current_user),
) -> TranscriptionJobResponse:
    job = JobRepository(db).get(job_id)
    if job is None or job.job_type != "transcription" or job.user_id != user.id:
        raise HTTPException(status_code=404, detail="Transcription job not found")
    return transcription_job_to_response(job)
