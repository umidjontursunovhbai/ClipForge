import shlex
import shutil
import subprocess
from pathlib import Path

from backend.core.config import settings


class LipSyncService:
    def generate(self, *, source_video: str, script: str, output_path: str, language: str, voice: str) -> str:
        output = Path(output_path)
        output.parent.mkdir(parents=True, exist_ok=True)

        if settings.lipsync_command:
            command = [
                part.format(
                    video_path=source_video,
                    script=script,
                    output_path=str(output),
                    language=language,
                    voice=voice,
                )
                for part in shlex.split(settings.lipsync_command)
            ]
            subprocess.run(command, check=True, timeout=60 * 60)
            return str(output)

        shutil.copy2(source_video, output)
        return str(output)
