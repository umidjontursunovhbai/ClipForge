from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes.generation_routes import router as generation_router
from backend.api.routes.health_routes import router as health_router
from backend.api.routes.template_routes import router as template_router
from backend.core.config import settings


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, version=settings.app_version)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(template_router, prefix="/api")
    app.include_router(generation_router, prefix="/api")
    return app


app = create_app()
