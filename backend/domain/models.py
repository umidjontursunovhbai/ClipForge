from dataclasses import dataclass


@dataclass(frozen=True)
class Template:
    id: str
    title: str
    length: str
    media_type: str
    media_url: str
    poster_url: str | None
    default_prompt: str


@dataclass(frozen=True)
class GenerationJob:
    id: str
    template_id: str
    status: str
    progress: int
    script: str
    language: str
    voice: str
    result_url: str | None = None
