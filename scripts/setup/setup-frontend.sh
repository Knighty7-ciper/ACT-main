#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR=$(cd "$(dirname "$0")/../.." && pwd)

pushd "$ROOT_DIR/frontend"
corepack enable
pnpm install
pnpm dev
popd
