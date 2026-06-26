import argparse
import os
import subprocess
import tempfile
from pathlib import Path


def run(command, cwd=None):
    env = os.environ.copy()
    env.setdefault("TORCH_HOME", "/app/models/torch")
    subprocess.run(command, cwd=cwd, env=env, check=True)


def main():
    parser = argparse.ArgumentParser(description="ClipForge local TTS + Wav2Lip runner")
    parser.add_argument("--video-path", required=True)
    parser.add_argument("--script", required=True)
    parser.add_argument("--output-path", required=True)
    parser.add_argument("--language", default="Uzbek")
    parser.add_argument("--voice", default="Casual")
    args = parser.parse_args()

    piper_binary = Path(os.getenv("CLIPFORGE_PIPER_BINARY", "/app/models/piper/piper"))
    piper_voice = Path(os.getenv("CLIPFORGE_PIPER_VOICE", "/app/models/voices/en_US-lessac-medium.onnx"))
    wav2lip_dir = Path(os.getenv("CLIPFORGE_WAV2LIP_DIR", "/app/models/wav2lip/src"))
    checkpoint = Path(os.getenv("CLIPFORGE_WAV2LIP_CHECKPOINT", "/app/models/wav2lip/checkpoints/wav2lip_gan.pth"))
    output_path = Path(args.output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    missing = [
        str(path)
        for path in [piper_binary, piper_voice, wav2lip_dir / "inference.py", checkpoint, Path(args.video_path)]
        if not path.exists()
    ]
    if missing:
        raise FileNotFoundError("Missing local model/runtime files: " + ", ".join(missing))

    with tempfile.TemporaryDirectory(prefix="clipforge_lipsync_") as temp_dir:
        audio_path = Path(temp_dir) / "speech.wav"
        piper = subprocess.Popen(
            [str(piper_binary), "--model", str(piper_voice), "--output_file", str(audio_path)],
            stdin=subprocess.PIPE,
            text=True,
        )
        piper.communicate(args.script)
        if piper.returncode != 0:
            raise RuntimeError(f"Piper failed with exit code {piper.returncode}")

        command = [
            "python3",
            "inference.py",
            "--checkpoint_path",
            str(checkpoint),
            "--face",
            str(Path(args.video_path).resolve()),
            "--audio",
            str(audio_path),
            "--outfile",
            str(output_path.resolve()),
            "--pads",
            "0",
            "10",
            "0",
            "0",
        ]
        box = os.getenv("CLIPFORGE_WAV2LIP_BOX", "").strip()
        if box:
            command.extend(["--box", *box.split()])
        run(command, cwd=str(wav2lip_dir))

    if not output_path.exists() or output_path.stat().st_size == 0:
        raise RuntimeError("Wav2Lip finished but did not create an output video")


if __name__ == "__main__":
    main()
