#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

mkdir -p models/piper models/voices models/wav2lip/checkpoints models/torch/hub/checkpoints .runtime

if [ ! -x models/piper/piper ]; then
  rm -rf /tmp/piper /tmp/piper.tar.gz
  curl -L --retry 3 -o /tmp/piper.tar.gz https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_amd64.tar.gz
  tar -xzf /tmp/piper.tar.gz -C /tmp
  cp -a /tmp/piper/* models/piper/
fi

if [ ! -f models/voices/en_US-lessac-medium.onnx ]; then
  curl -L --retry 3 -o models/voices/en_US-lessac-medium.onnx https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx
  curl -L --retry 3 -o models/voices/en_US-lessac-medium.onnx.json https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json
fi

if [ ! -d models/wav2lip/src/.git ]; then
  rm -rf models/wav2lip/src
  git clone --depth 1 https://github.com/Rudrabha/Wav2Lip.git models/wav2lip/src
fi

python3 - <<"PY"
from pathlib import Path
p = Path("models/wav2lip/src/audio.py")
if p.exists():
    text = p.read_text()
    text = text.replace(
        "return librosa.filters.mel(hp.sample_rate, hp.n_fft, n_mels=hp.num_mels,",
        "return librosa.filters.mel(sr=hp.sample_rate, n_fft=hp.n_fft, n_mels=hp.num_mels,",
    )
    p.write_text(text)
PY

if [ ! -f models/wav2lip/checkpoints/wav2lip_gan.pth ]; then
  curl -L --retry 3 -o models/wav2lip/checkpoints/wav2lip_gan.pth https://github.com/anothermartz/Easy-Wav2Lip/releases/download/Prerequesits/Wav2Lip_GAN.pth
fi

if [ ! -f models/torch/hub/checkpoints/s3fd-619a316812.pth ]; then
  curl -L --retry 3 -o models/torch/hub/checkpoints/s3fd-619a316812.pth https://huggingface.co/wsj1995/sadTalker/resolve/main/s3fd-619a316812.pth
fi

echo "Local model assets are ready under $ROOT/models"
