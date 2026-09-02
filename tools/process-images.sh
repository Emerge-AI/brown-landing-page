#!/usr/bin/env bash
# Image pipeline: select, resize, strip EXIF, and encode JPEG + WebP
# renditions from the raw photo shoot into docs/assets/img/.
# Before/after clinical photos live in $SRC/before-after/ (supplied by the practice).
# Requires: imagemagick (magick), webp (cwebp) — brew install imagemagick webp
set -euo pipefail

SRC="${1:-/Users/varunkumar/Downloads/Patrick}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/docs/assets/img"
mkdir -p "$OUT"

# slug|source|widths|crop (crop: WxH aspect for portrait headshots, "-" = none)
MANIFEST=$(cat <<'EOF'
dental-implant-exam-fort-worth-dentist|_DSC7922.jpg|480 800 1200 1600 1920|-
dental-implant-3d-imaging-fort-worth|_DSC7926.jpg|480 800 1200|-
dental-implant-consultation-fort-worth|_DSC7933.jpg|480 800 1200|-
dental-office-waiting-room-fort-worth|_DSC7942-HDR.jpg|480 800 1200|-
marshall-h-brown-dds-dental-team-fort-worth|_1021091-Edit.jpg|480 800 1200 1600|-
dr-patrick-kamgang-dds-fort-worth-dentist|_1020993.jpg|480 800|4:5
dr-marshall-brown-dds-fort-worth-dentist|_1021062.jpg|480 800|4:5
dental-office-hallway-fort-worth|_DSC7930.jpg|480 800 1200|-
modern-dental-operatory-fort-worth|_DSC7924.jpg|480 800 1200|-
dental-team-members-fort-worth|_1021070.jpg|480 800 1200|-
dental-implants-before-missing-front-teeth-fort-worth|before-after/case1-before.png|480 800 1200|-
dental-implants-after-restored-smile-fort-worth|before-after/case1-after.jpg|480 800 1200|-
smile-makeover-before-fort-worth|before-after/case2-before.jpg|480 800 1200|-
smile-makeover-after-fort-worth|before-after/case2-after.jpg|480 800 1200|-
EOF
)

# Optional: ONLY=<regex> ./tools/process-images.sh  -> re-encode matching slugs only.
ONLY="${ONLY:-}"

while IFS='|' read -r slug file widths crop; do
  [[ -z "$ONLY" || "$slug" =~ $ONLY ]] || continue
  src="$SRC/$file"
  [[ -f "$src" ]] || { echo "MISSING: $src" >&2; exit 1; }
  for w in $widths; do
    jpg="$OUT/${slug}-${w}.jpg"
    if [[ "$crop" == "-" ]]; then
      magick "$src" -auto-orient -strip -resize "${w}x>" -quality 82 "$jpg"
    else
      # center-weighted crop to aspect, biased toward the top for headshots
      magick "$src" -auto-orient -strip -gravity north -crop "$crop" +repage \
        -resize "${w}x>" -quality 82 "$jpg"
    fi
    cwebp -quiet -q 78 -metadata none "$jpg" -o "$OUT/${slug}-${w}.webp"
    kb=$(( $(stat -f%z "$jpg") / 1024 ))
    (( kb > 200 )) && echo "WARN: ${slug}-${w}.jpg is ${kb}KB (>200KB)" || true
  done
  echo "done: $slug ($widths)"
done <<< "$MANIFEST"

echo "---"
ls -lh "$OUT" | awk '{print $5, $9}' | tail -n +2
