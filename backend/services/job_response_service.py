from backend.api.schemas.template_schemas import TranscriptionJobResponse
from backend.database.models import JobRecord


def transcription_job_to_response(job: JobRecord) -> TranscriptionJobResponse:
    probability = None
    if job.language_probability is not None:
        try:
            probability = float(job.language_probability)
        except ValueError:
            probability = None

    return TranscriptionJobResponse(
        id=job.id,
        template_id=job.template_id,
        status=job.status,
        progress=job.progress,
        language=job.language if job.language else None,
        language_probability=probability,
        text=job.result_text,
        error=job.error,
    )
