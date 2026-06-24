from uuid import uuid4

from fastapi import HTTPException

from backend.api.schemas.generation_schemas import GenerationJobResponse, GeneratePreviewRequest
from backend.database.models import JobRecord, UserRecord
from backend.repositories.job_repository import JobRepository
from backend.repositories.template_repository import TemplateRepository


def generation_job_to_response(job: JobRecord) -> GenerationJobResponse:
    return GenerationJobResponse(
        id=job.id,
        template_id=job.template_id,
        status=job.status,
        progress=job.progress,
        script=job.script,
        language=job.language,
        voice=job.voice,
        result_url=job.result_url,
        error=job.error,
    )


class GenerationService:
    def __init__(self, jobs: JobRepository, templates: TemplateRepository) -> None:
        self.jobs = jobs
        self.templates = templates

    def create_preview_job(self, payload: GeneratePreviewRequest, user: UserRecord) -> GenerationJobResponse:
        if self.templates.get(payload.template_id) is None:
            raise HTTPException(status_code=404, detail="Template not found")

        job = JobRecord(
            id=f"gen_{uuid4().hex}",
            job_type="generation",
            user_id=user.id,
            template_id=payload.template_id,
            status="queued",
            progress=0,
            script=payload.script,
            language=payload.language,
            voice=payload.voice,
        )
        return generation_job_to_response(self.jobs.create(job))

    def get_job(self, job_id: str, user: UserRecord) -> GenerationJobResponse:
        job = self.jobs.get(job_id)
        if job is None or job.job_type != "generation" or job.user_id != user.id:
            raise HTTPException(status_code=404, detail="Generation job not found")
        return generation_job_to_response(job)
