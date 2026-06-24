from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.api.routes.auth_routes import router as auth_router
from backend.api.routes.generation_routes import router as generation_router
from backend.api.routes.health_routes import router as health_router
from backend.api.routes.template_routes import router as template_router
from backend.core.config import settings
from backend.database.init_db import init_database


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, version=settings.app_version)

    @app.on_event("startup")
    def startup() -> None:
        init_database()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(auth_router, prefix="/api")
    app.include_router(template_router, prefix="/api")
    app.include_router(generation_router, prefix="/api")
    Path(settings.generated_storage_dir).mkdir(parents=True, exist_ok=True)
    app.mount(settings.generated_base_url, StaticFiles(directory=settings.generated_storage_dir), name="generated")
    return app


app = create_app()
