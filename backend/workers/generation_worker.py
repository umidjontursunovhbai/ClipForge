from pathlib import Path
from uuid import uuid4

from backend.core.config import settings
from backend.database.models import GeneratedAssetRecord
from backend.database.session import SessionLocal
from backend.repositories.job_repository import JobRepository
from backend.repositories.template_repository import TemplateRepository
from backend.services.lipsync_service import LipSyncService


def run_generation_job(job_id: str) -> None:
    with SessionLocal() as db:
        jobs = JobRepository(db)
        templates = TemplateRepository(db)
        job = jobs.get(job_id)
        if job is None:
            return

        try:
            template = templates.get(job.template_id)
            if template is None or template.source_path is None:
                raise ValueError("Template media not found")

            job.status = "running"
            job.progress = 18
            jobs.save(job)

            source_path = Path(template.source_path)
            if not source_path.exists():
                raise ValueError(f"Template media missing on disk: {source_path}")

            output_name = f"{job.id}.mp4"
            output_path = Path(settings.generated_storage_dir) / output_name
            job.progress = 45
            jobs.save(job)

            LipSyncService().generate(
                source_video=str(source_path),
                script=job.script,
                output_path=str(output_path),
                language=job.language,
                voice=job.voice,
            )

            public_url = f"{settings.generated_base_url.rstrip('/')}/{output_name}"
            asset = GeneratedAssetRecord(
                id=f"asset_{uuid4().hex}",
                job_id=job.id,
                user_id=job.user_id,
                template_id=job.template_id,
                storage_path=str(output_path),
                public_url=public_url,
                media_type="video",
            )
            jobs.add_asset(asset)

            job.status = "completed"
            job.progress = 100
            job.result_url = public_url
            jobs.save(job)
        except Exception as exc:
            job.status = "failed"
            job.progress = 100
            job.error = str(exc)
            jobs.save(job)
