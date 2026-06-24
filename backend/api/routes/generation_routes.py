from fastapi import APIRouter

from backend.api.schemas.generation_schemas import (
    GenerationJobResponse,
    GeneratePreviewRequest,
)
from backend.repositories.generation_job_repository import GenerationJobRepository
from backend.services.generation_service import GenerationService

router = APIRouter(prefix="/generation", tags=["generation"])
generation_service = GenerationService(repository=GenerationJobRepository())


@router.post("/preview", response_model=GenerationJobResponse)
def create_preview_job(payload: GeneratePreviewRequest) -> GenerationJobResponse:
    return generation_service.create_preview_job(payload)


@router.get("/jobs/{job_id}", response_model=GenerationJobResponse)
def get_generation_job(job_id: str) -> GenerationJobResponse:
    return generation_service.get_job(job_id)
