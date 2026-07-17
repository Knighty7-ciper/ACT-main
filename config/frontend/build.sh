#!/bin/bash
cd "$(dirname "$0")"
NODE_OPTIONS="--max-old-space-size=4096" npx vite build --mode production 2>&1
