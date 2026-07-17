# ACT Coin Platform

PPP-based cryptocurrency platform built on Next.js 16 + React 19, with Better Auth and Drizzle ORM on Postgres (Neon).

## Quick start

### 1. Install

```bash
pnpm install
```

### 2. Configure env

Copy `.env.example` to `.env.local` and fill in:

```bash
DATABASE_URL=postgresql://...     # from Neon
BETTER_AUTH_SECRET=...           # run: openssl rand -base64 32
```

### 3. Push DB schema

```bash
pnpm db:push
```

### 4. Run

```bash
pnpm dev
```

App runs at http://localhost:3000.

## Deploy to Vercel

1. Push this repo to GitHub (or import via Vercel CLI).
2. In Vercel → Project Settings → Environment Variables, add:
   - `DATABASE_URL` (Neon integration auto-injects this if you connect Neon)
   - `BETTER_AUTH_SECRET` (generate with `openssl rand -base64 32` and paste)
3. Deploy.
4. After first deploy, run `pnpm db:push` locally **with the production `DATABASE_URL`** in your `.env.local` to create the tables.
5. Redeploy.

## Environment variables

| Name | Required | Notes |
|------|----------|-------|
| `DATABASE_URL` | Yes | Postgres connection string. Neon integration auto-injects. |
| `BETTER_AUTH_SECRET` | Yes | Generate with `openssl rand -base64 32`. Must be set manually. |
| `BETTER_AUTH_URL` | No | Only needed outside Vercel. Vercel auto-sets `VERCEL_URL`. |
| `NODE_ENV` | No | Set to `production` on Vercel automatically. |

## Scripts

| Script | What it does |
|--------|--------------|
| `pnpm dev` | Local dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm db:push` | Push Drizzle schema to the DB |
| `pnpm db:generate` | Generate SQL migration files |
| `pnpm db:studio` | Open Drizzle Studio (DB GUI) |
| `pnpm lint` | Run ESLint |

## Project structure

```
app/
  actions/         Server actions (auth, profile)
  api/             API routes (auth catch-all, ppp, transactions)
  error.tsx        Route-level error boundary
  global-error.tsx Root error boundary
  loading.tsx      Loading state
  not-found.tsx    404 page
  layout.tsx       Root layout
  page.tsx         Dashboard (auth-gated)
  sign-in/         Sign-in page
  sign-up/         Sign-up page
components/
  ui/              shadcn/ui components (Base UI)
  auth-form.tsx    Reusable sign-in / sign-up form
lib/
  auth.ts          Better Auth instance
  auth-client.ts   Better Auth client
  db/              Drizzle setup + schema
drizzle.config.ts  Drizzle Kit config
```
