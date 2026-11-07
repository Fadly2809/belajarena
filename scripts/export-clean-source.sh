#!/usr/bin/env bash
set -e

# Resolve project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

OUTPUT_NAME="belajarena-clean-source-$(date +'%Y%m%d-%H%M%S').zip"
OUTPUT_PATH="$PROJECT_ROOT/$OUTPUT_NAME"

echo "=== Mengompresi Source Code Belajarena (Clean Export) ==="
echo "Lokasi Root: $PROJECT_ROOT"
echo "File Output: $OUTPUT_PATH"

cd "$PROJECT_ROOT"

# Use high-compression zip (-9) preserving symlinks (-y), excluding heavy runtime/temp items
zip -9 -r -y -q "$OUTPUT_PATH" . \
  -x "node_modules/*" \
  -x "*/node_modules/*" \
  -x "apps/api/vendor/*" \
  -x "apps/api/backups/*" \
  -x "apps/api/storage/slides/*" \
  -x "apps/api/database/*.tmp" \
  -x "apps/api/database/*.backup*.json" \
  -x ".git/*" \
  -x ".DS_Store" \
  -x "*/.DS_Store" \
  -x "*.log" \
  -x "*.zip"

echo "🔍 Memverifikasi integritas arsip ZIP..."
zip -T "$OUTPUT_PATH"
FILESIZE=$(ls -lh "$OUTPUT_PATH" | awk '{print $5}')
echo "✓ Berhasil mengekspor: $OUTPUT_NAME ($FILESIZE)"
echo "File bersih tanpa node_modules, storage/slides, atau file cadangan."

