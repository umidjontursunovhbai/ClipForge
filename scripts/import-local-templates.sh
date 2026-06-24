#!/usr/bin/env bash
set -euo pipefail

source_root="${1:-/Users/gg/Public/videogen/vd-gen.api-service/media/templates}"
output_dir="${2:-public/assets/templates/local}"

for command_name in ffmpeg ffprobe; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: $command_name"
    exit 1
  fi
done

mkdir -p "$output_dir"

shopt -s nullglob
sources=("$source_root"/template_*/test*.mp4)

if [[ "${#sources[@]}" -eq 0 ]]; then
  echo "No test*.mp4 files found under: $source_root"
  exit 1
fi

for src in "${sources[@]}"; do
  folder="$(basename "$(dirname "$src")")"
  number="${folder#template_}"
  slug="local-template-$number"
  final_path="$output_dir/$slug.mp4"
  poster_path="$output_dir/$slug-poster.jpg"
  width="$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$src")"

  if [[ "$width" -gt 720 ]]; then
    ffmpeg -hide_banner -loglevel error -y \
      -i "$src" \
      -vf "scale=720:-2" \
      -c:v libx264 \
      -preset medium \
      -crf 23 \
      -pix_fmt yuv420p \
      -c:a aac \
      -b:a 96k \
      -movflags +faststart \
      "$final_path"
  else
    ffmpeg -hide_banner -loglevel error -y \
      -i "$src" \
      -c copy \
      -movflags +faststart \
      "$final_path"
  fi

  ffmpeg -hide_banner -loglevel error -y \
    -ss 00:00:01 \
    -i "$final_path" \
    -frames:v 1 \
    -update 1 \
    -q:v 2 \
    "$poster_path"

  duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$final_path")"
  echo "$slug imported, duration=${duration}s"
done

echo "Imported ${#sources[@]} local template video(s) into $output_dir"
