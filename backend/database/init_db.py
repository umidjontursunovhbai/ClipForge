from pathlib import Path

from backend.core.config import settings
from backend.database.models import Base
from backend.database.seed import seed_database
from backend.database.session import SessionLocal, engine


def init_database() -> None:
    Path(settings.generated_storage_dir).mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database(db)
