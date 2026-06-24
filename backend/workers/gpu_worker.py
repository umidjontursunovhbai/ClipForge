def enqueue_generation_job(job_id: str) -> None:
    """Future hook for Redis/Celery/RQ GPU worker dispatch."""
    _ = job_id
