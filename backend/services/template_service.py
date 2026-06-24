from fastapi import HTTPException

from backend.api.schemas.template_schemas import TemplateResponse
from backend.repositories.template_repository import TemplateRepository


class TemplateService:
    def __init__(self, repository: TemplateRepository) -> None:
        self.repository = repository

    def list_templates(self) -> list[TemplateResponse]:
        return [TemplateResponse(**template.__dict__) for template in self.repository.list()]

    def get_template(self, template_id: str) -> TemplateResponse:
        template = self.repository.get(template_id)
        if template is None:
            raise HTTPException(status_code=404, detail="Template not found")
        return TemplateResponse(**template.__dict__)
