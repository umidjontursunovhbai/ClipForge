#!/usr/bin/env bash
set -euo pipefail

url="${1:-}"
slug="${2:-}"

if [[ -z "$url" || -z "$slug" ]]; then
  echo "Usage: npm run import:instagram -- <instagram-url> <slug>"
  echo "Example: npm run import:instagram -- https://www.instagram.com/p/DZ7GcVTFOcc/ instagram-dz7gcvtfocc"
  exit 1
fi

for command_name in yt-dlp ffmpeg ffprobe; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: $command_name"
    exit 1
  fi
done

output_dir="public/assets/templates"
mkdir -p "$output_dir"

raw_path="$output_dir/$slug.raw.mp4"
final_path="$output_dir/$slug.mp4"
poster_path="$output_dir/$slug-poster.jpg"

yt-dlp --no-playlist \
  -f "bv*+ba/b" \
  --merge-output-format mp4 \
  -o "$raw_path" \
  "$url"

ffmpeg -y \
  -i "$raw_path" \
  -vf "scale=720:-2" \
  -c:v libx264 \
  -preset medium \
  -crf 23 \
  -pix_fmt yuv420p \
  -c:a aac \
  -b:a 96k \
  -movflags +faststart \
  "$final_path"

ffmpeg -y \
  -ss 00:00:01 \
  -i "$final_path" \
  -frames:v 1 \
  -update 1 \
  -q:v 2 \
  "$poster_path"

rm -f "$raw_path"

echo "Imported template video:"
ffprobe -v error \
  -show_entries format=size,duration \
  -show_entries stream=codec_name,width,height \
  -of default=noprint_wrappers=1 \
  "$final_path"
echo "Video:  /assets/templates/$slug.mp4"
echo "Poster: /assets/templates/$slug-poster.jpg"
