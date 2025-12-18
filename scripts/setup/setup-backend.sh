#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR=$(cd "$(dirname "$0")/../.." && pwd)

pushd "$ROOT_DIR/backend"
corepack enable
pnpm install
pnpm build || true
pnpm dev
popd
