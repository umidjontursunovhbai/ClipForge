from pydantic import BaseModel, Field


class GeneratePreviewRequest(BaseModel):
    template_id: str
    script: str = Field(min_length=4, max_length=1000)
    language: str = "Uzbek"
    voice: str = "Casual"


class GenerationJobResponse(BaseModel):
    id: str
    template_id: str
    status: str
    progress: int
    script: str
    language: str
    voice: str
    result_url: str | None = None
    error: str | None = None


class GeneratedAssetResponse(BaseModel):
    id: str
    job_id: str
    template_id: str
    script: str
    public_url: str
    media_type: str
    created_at: str
