from fastapi import HTTPException

from backend.api.schemas.template_schemas import TemplateResponse
from backend.database.models import TemplateRecord
from backend.repositories.template_repository import TemplateRepository


def template_to_response(template: TemplateRecord) -> TemplateResponse:
    return TemplateResponse(
        id=template.id,
        title=template.title,
        length=template.length,
        media_type=template.media_type,
        media_url=template.media_url,
        poster_url=template.poster_url,
        default_prompt=template.default_prompt,
        tone=template.tone,
    )


class TemplateService:
    def __init__(self, repository: TemplateRepository) -> None:
        self.repository = repository

    def list_templates(self) -> list[TemplateResponse]:
        return [template_to_response(template) for template in self.repository.list()]

    def get_template(self, template_id: str) -> TemplateResponse:
        template = self.repository.get(template_id)
        if template is None:
            raise HTTPException(status_code=404, detail="Template not found")
        return template_to_response(template)
