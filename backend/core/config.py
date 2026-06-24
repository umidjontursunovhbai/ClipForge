from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ClipForge API"
    app_version: str = "0.1.0"
    cors_origins: list[str] = ["http://127.0.0.1:5173", "http://localhost:5173"]
    frontend_public_dir: str = "apps/frontend/public"
    database_url: str = "postgresql+psycopg://clipforge:clipforge@127.0.0.1:5432/clipforge"
    generated_storage_dir: str = "backend/storage/generated"
    generated_base_url: str = "/generated"
    transcription_model_size: str = "small"
    transcription_device: str = "auto"
    transcription_compute_type: str = "auto"
    admin_username: str = "admin"
    admin_password: str = "admin12345"
    session_ttl_hours: int = 24
    lipsync_command: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_prefix="CLIPFORGE_")


settings = Settings()
