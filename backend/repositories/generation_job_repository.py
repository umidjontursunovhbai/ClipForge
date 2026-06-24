from uuid import uuid4

from fastapi import HTTPException

from backend.domain.models import GenerationJob


class GenerationJobRepository:
    def __init__(self) -> None:
        self.jobs: dict[str, GenerationJob] = {}

    def next_id(self) -> str:
        return str(uuid4())

    def save(self, job: GenerationJob) -> None:
        self.jobs[job.id] = job

    def get(self, job_id: str) -> GenerationJob:
        job = self.jobs.get(job_id)
        if job is None:
            raise HTTPException(status_code=404, detail="Generation job not found")
        return job
