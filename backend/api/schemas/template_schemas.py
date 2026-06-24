from pydantic import BaseModel


class TemplateResponse(BaseModel):
    id: str
    title: str
    length: str
    media_type: str
    media_url: str
    poster_url: str | None = None
    default_prompt: str


class TranscriptionSegmentResponse(BaseModel):
    start: float
    end: float
    text: str


class TemplateTranscriptionResponse(BaseModel):
    template_id: str
    language: str | None
    language_probability: float | None
    text: str
    segments: list[TranscriptionSegmentResponse]
