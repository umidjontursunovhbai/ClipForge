from pathlib import Path
from shutil import which
from typing import Any

from fastapi import HTTPException

from backend.api.schemas.template_schemas import (
    TemplateTranscriptionResponse,
    TranscriptionSegmentResponse,
)
from backend.core.config import settings
from backend.repositories.template_repository import TemplateRepository


class LocalWhisperTranscriptionService:
    def __init__(self, repository: TemplateRepository) -> None:
        self.repository = repository
        self._model: Any | None = None

    def transcribe_template(self, template_id: str) -> TemplateTranscriptionResponse:
        template = self.repository.get(template_id)
        if template is None:
            raise HTTPException(status_code=404, detail="Template not found")
        if template.source_path is None:
            raise HTTPException(status_code=400, detail="Template has no local media path")

        media_path = Path(template.source_path)
        if not media_path.exists():
            raise HTTPException(status_code=404, detail=f"Template media not found: {media_path}")

        model = self._get_model()
        segments_iter, info = model.transcribe(
            str(media_path),
            beam_size=5,
            vad_filter=True,
            word_timestamps=False,
        )
        segments = [
            TranscriptionSegmentResponse(
                start=float(segment.start),
                end=float(segment.end),
                text=segment.text.strip(),
            )
            for segment in segments_iter
        ]
        text = " ".join(segment.text for segment in segments).strip()

        return TemplateTranscriptionResponse(
            template_id=template.id,
            language=getattr(info, "language", None),
            language_probability=getattr(info, "language_probability", None),
            text=text,
            segments=segments,
        )

    def _get_model(self) -> Any:
        if self._model is not None:
            return self._model

        try:
            from faster_whisper import WhisperModel
        except ImportError as exc:
            raise HTTPException(
                status_code=503,
                detail="Local transcription model is not installed. Run pip install -r backend/requirements.txt.",
            ) from exc

        device = self._select_device()
        compute_type = self._select_compute_type(device)
        self._model = WhisperModel(
            settings.transcription_model_size,
            device=device,
            compute_type=compute_type,
        )
        return self._model

    def _select_device(self) -> str:
        if settings.transcription_device != "auto":
            return settings.transcription_device
        return "cuda" if which("nvidia-smi") else "cpu"

    def _select_compute_type(self, device: str) -> str:
        if settings.transcription_compute_type != "auto":
            return settings.transcription_compute_type
        return "float16" if device == "cuda" else "int8"
