from pathlib import Path
from uuid import uuid4

from sqlalchemy.orm import Session

from backend.core.config import settings
from backend.database.models import TemplateRecord, UserRecord
from backend.services.password_service import create_password_hash

DEFAULT_PROMPT = "Bugun sizga bitta muhim fikrni aytaman."


def seed_admin_user(db: Session) -> None:
    existing = db.query(UserRecord).filter(UserRecord.username == settings.admin_username).first()
    if existing is not None:
        return

    password_hash, salt = create_password_hash(settings.admin_password)
    db.add(
        UserRecord(
            id=f"user_{uuid4().hex}",
            username=settings.admin_username,
            password_hash=password_hash,
            password_salt=salt,
            role="admin",
        )
    )


def seed_templates(db: Session) -> None:
    public_dir = Path(settings.frontend_public_dir)
    local_dir = public_dir / "assets/templates/local"
    records: list[TemplateRecord] = []

    for media_path in sorted(local_dir.glob("local-template-*.mp4")):
        template_id = media_path.stem
        poster_path = media_path.with_name(f"{template_id}-poster.jpg")
        number = template_id.split("-")[-1]
        records.append(
            TemplateRecord(
                id=template_id,
                title=f"Template {number}",
                length="",
                media_type="video",
                media_url=f"/assets/templates/local/{media_path.name}",
                poster_url=f"/assets/templates/local/{poster_path.name}" if poster_path.exists() else None,
                default_prompt=DEFAULT_PROMPT,
                source_path=str(media_path),
                tone="Casual",
            )
        )

    instagram_path = public_dir / "assets/templates/instagram-dz7gcvtfocc.mp4"
    if instagram_path.exists():
        records.insert(
            0,
            TemplateRecord(
                id="instagram-dz7gcvtfocc",
                title="Instagram template 01",
                length="",
                media_type="video",
                media_url="/assets/templates/instagram-dz7gcvtfocc.mp4",
                poster_url="/assets/templates/instagram-dz7gcvtfocc-poster.jpg",
                default_prompt=DEFAULT_PROMPT,
                source_path=str(instagram_path),
                tone="Confident",
            ),
        )

    for record in records:
        existing = db.get(TemplateRecord, record.id)
        if existing is None:
            db.add(record)
            continue

        existing.title = record.title
        existing.length = record.length
        existing.media_type = record.media_type
        existing.media_url = record.media_url
        existing.poster_url = record.poster_url
        existing.default_prompt = record.default_prompt
        existing.source_path = record.source_path
        existing.tone = record.tone


def seed_database(db: Session) -> None:
    seed_admin_user(db)
    seed_templates(db)
    db.commit()
