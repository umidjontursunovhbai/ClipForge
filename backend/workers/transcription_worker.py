from backend.database.session import SessionLocal
from backend.repositories.job_repository import JobRepository
from backend.repositories.template_repository import TemplateRepository
from backend.services.transcription_service import LocalWhisperTranscriptionService


def run_transcription_job(job_id: str) -> None:
    with SessionLocal() as db:
        jobs = JobRepository(db)
        job = jobs.get(job_id)
        if job is None:
            return

        try:
            job.status = "running"
            job.progress = 15
            jobs.save(job)

            transcription_service = LocalWhisperTranscriptionService(repository=TemplateRepository(db))
            result = transcription_service.transcribe_template(job.template_id)

            job.status = "completed"
            job.progress = 100
            job.result_text = result.text
            job.language = result.language or ""
            job.language_probability = (
                str(result.language_probability) if result.language_probability is not None else None
            )
            jobs.save(job)
        except Exception as exc:
            job.status = "failed"
            job.progress = 100
            job.error = str(exc)
            jobs.save(job)
