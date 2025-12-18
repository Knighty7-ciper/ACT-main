#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"

"$here/reset_db.sh"
"$here/seed_db.sh"

echo "✓ Rebuild complete"
