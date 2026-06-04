#!/bin/bash
# Run from the selfcare-jalali-pwa repo root after git pull.
# Copies updated support-ticketing source files to ~/support-ticketing.
set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET="$HOME/support-ticketing"

if [ ! -d "$TARGET" ]; then
  echo "Error: $TARGET not found. Run create-support-ticketing.sh first."
  exit 1
fi

echo "Syncing support-ticketing files..."

# Sync source files
cp -r "$REPO_DIR/support-ticketing/src/"* "$TARGET/src/"

# Sync public assets (header image etc)
mkdir -p "$TARGET/public/assets"
cp -r "$REPO_DIR/support-ticketing/public/assets/"* "$TARGET/public/assets/" 2>/dev/null || true

echo "Done. cd ~/support-ticketing && npm run dev"
