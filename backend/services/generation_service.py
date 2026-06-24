from backend.api.schemas.generation_schemas import (
    GenerationJobResponse,
    GeneratePreviewRequest,
)
from backend.domain.models import GenerationJob
from backend.repositories.generation_job_repository import GenerationJobRepository


class GenerationService:
    def __init__(self, repository: GenerationJobRepository) -> None:
        self.repository = repository

    def create_preview_job(self, payload: GeneratePreviewRequest) -> GenerationJobResponse:
        job = GenerationJob(
            id=self.repository.next_id(),
            template_id=payload.template_id,
            status="queued",
            progress=0,
            script=payload.script,
            language=payload.language,
            voice=payload.voice,
        )
        self.repository.save(job)
        return GenerationJobResponse(**job.__dict__)

    def get_job(self, job_id: str) -> GenerationJobResponse:
        job = self.repository.get(job_id)
        return GenerationJobResponse(**job.__dict__)
