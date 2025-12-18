# Monorepo builder image (optional)
FROM node:18-alpine AS base
RUN corepack enable && apk add --no-cache git
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY . .

# Backend build
FROM base AS backend-build
WORKDIR /app/backend
RUN pnpm build

# Frontend build
FROM base AS frontend-build
WORKDIR /app/frontend
RUN pnpm build

# This Dockerfile provides build artifacts; prefer per-package Dockerfiles for runtime images.
