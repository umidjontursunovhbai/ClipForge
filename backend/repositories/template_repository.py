from backend.domain.models import Template


class TemplateRepository:
    def __init__(self) -> None:
        self.templates = [
            Template(
                id=f"local-template-{number:03d}",
                title=f"Template {number:03d}",
                length="",
                media_type="video",
                media_url=f"/assets/templates/local/local-template-{number:03d}.mp4",
                poster_url=f"/assets/templates/local/local-template-{number:03d}-poster.jpg",
                default_prompt="Bugun sizga bitta muhim fikrni aytaman.",
            )
            for number in range(1, 21)
        ]

    def list(self) -> list[Template]:
        return self.templates

    def get(self, template_id: str) -> Template | None:
        return next((template for template in self.templates if template.id == template_id), None)
