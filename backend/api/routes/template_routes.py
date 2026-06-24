from fastapi import APIRouter

from backend.api.schemas.template_schemas import TemplateResponse, TemplateTranscriptionResponse
from backend.repositories.template_repository import TemplateRepository
from backend.services.template_service import TemplateService
from backend.services.transcription_service import LocalWhisperTranscriptionService

router = APIRouter(prefix="/templates", tags=["templates"])
template_repository = TemplateRepository()
template_service = TemplateService(repository=template_repository)
transcription_service = LocalWhisperTranscriptionService(repository=template_repository)


@router.get("", response_model=list[TemplateResponse])
def list_templates() -> list[TemplateResponse]:
    return template_service.list_templates()


@router.get("/{template_id}", response_model=TemplateResponse)
def get_template(template_id: str) -> TemplateResponse:
    return template_service.get_template(template_id)


@router.post("/{template_id}/transcription", response_model=TemplateTranscriptionResponse)
def transcribe_template(template_id: str) -> TemplateTranscriptionResponse:
    return transcription_service.transcribe_template(template_id)
