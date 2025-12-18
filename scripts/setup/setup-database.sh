#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT_DIR=$(cd "$SCRIPT_DIR/../.." && pwd)

export NODE_ENV=${NODE_ENV:-development}

echo "Initializing database..."
node "$ROOT_DIR/scripts/run-init.mjs"
echo "Done."
