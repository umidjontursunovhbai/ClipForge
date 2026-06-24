from pydantic import BaseModel


class TemplateResponse(BaseModel):
    id: str
    title: str
    length: str
    media_type: str
    media_url: str
    poster_url: str | None = None
    default_prompt: str
