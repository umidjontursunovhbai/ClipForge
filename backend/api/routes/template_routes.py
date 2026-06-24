from fastapi import APIRouter

from backend.api.schemas.template_schemas import TemplateResponse
from backend.repositories.template_repository import TemplateRepository
from backend.services.template_service import TemplateService

router = APIRouter(prefix="/templates", tags=["templates"])
template_service = TemplateService(repository=TemplateRepository())


@router.get("", response_model=list[TemplateResponse])
def list_templates() -> list[TemplateResponse]:
    return template_service.list_templates()


@router.get("/{template_id}", response_model=TemplateResponse)
def get_template(template_id: str) -> TemplateResponse:
    return template_service.get_template(template_id)
