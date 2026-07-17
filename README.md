# ACT Coin Platform

A PPP-based cryptocurrency platform built on **Next.js 16 + React 19**, with **Better Auth** for authentication and **Drizzle ORM** on **PostgreSQL** (Neon).

---

## Quick start

```bash
# 1. Install
pnpm install

# 2. Set up env
cp .env.example .env.local
# then edit .env.local with your values

# 3. Push the DB schema
pnpm db:push

# 4. Run
pnpm dev
```

App runs at **http://localhost:3000**.

---

## Deploy to Vercel

### Step 1 — Get a Postgres database

1. Go to [neon.tech](https://neon.tech) and create a free project.
2. Copy the **connection string** (looks like `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`).

### Step 2 — Generate the auth secret

```bash
openssl rand -base64 32
```

Copy the output.

### Step 3 — Push to GitHub & import to Vercel

```bash
git init
git add .
git commit -m "init"
git remote add origin <your-repo-url>
git push -u origin main
```

Then in Vercel → **Add New Project** → import the repo. Vercel will auto-detect it as a Next.js app.

### Step 4 — Add environment variables in Vercel

Vercel → Project → **Settings** → **Environment Variables**. Add these two:

| Name | Value | Where to get it |
|------|-------|-----------------|
| `DATABASE_URL` | `postgresql://...` | Your Neon connection string from Step 1 |
| `BETTER_AUTH_SECRET` | the random string | The output from Step 2 |

Apply to: **Production**, **Preview**, and **Development** (toggle all three).

> **Do NOT add** any of: `BACKEND_PORT`, `JWT_SECRET`, `STELLAR_*`, `PESAPAL_*`, `SENDGRID_API_KEY`, `AWS_*`, `NEXT_PUBLIC_SUPABASE_*`, `RESEND_API_KEY`, `SENTRY_*`, `CORS_ORIGIN`, etc. Those are from a previous Express-based version of the app and are not used here.

### Step 5 — (Easiest) Connect Neon to Vercel directly

Instead of pasting `DATABASE_URL` manually, use Vercel's **Storage** tab → **Connect Store** → **Neon** → pick your project. This auto-injects `DATABASE_URL` into every deployment.

### Step 6 — Deploy

Click **Deploy**. Vercel will build and give you a URL like `https://your-app.vercel.app`.

### Step 7 — Push the DB schema (one-time, after first deploy)

Locally, with your **production** `DATABASE_URL` in `.env.local`:

```bash
pnpm db:push
```

This creates the 8 tables in your Neon DB: `user`, `session`, `account`, `verification` (Better Auth) + `profiles`, `wallets`, `transactions`, `ppp_data` (app).

### Step 8 — Redeploy

After the schema is pushed, trigger a redeploy in Vercel (Deployments → ⋯ → Redeploy) so the new tables are picked up.

### Step 9 — Test

1. Visit your Vercel URL
2. Click **Sign up**, create an account
3. You should land on the dashboard
4. Sign out / sign in works

---

## Environment variables reference

Only these are referenced anywhere in the code:

| Variable | Required | Auto-set by Vercel? | Purpose |
|----------|----------|---------------------|---------|
| `DATABASE_URL` | ✅ | ⚠️ Only if Neon integration is connected | Postgres connection string |
| `BETTER_AUTH_SECRET` | ✅ | ❌ — must be added manually | Signs session cookies |
| `BETTER_AUTH_URL` | ❌ | Auto-falls back to `VERCEL_URL` | Auth base URL |
| `NODE_ENV` | ❌ | ✅ Set to `production` automatically | Toggles dev cookie config |
| `VERCEL_URL` | ❌ | ✅ Auto-injected | Used as baseURL fallback |
| `VERCEL_PROJECT_PRODUCTION_URL` | ❌ | ✅ Auto-injected | Production URL fallback |

That's the whole list. No other env vars are read by the app.

---

## Scripts

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Local dev server (http://localhost:3000) |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm lint` | Run ESLint |
| `pnpm db:push` | Push schema directly to the DB (no migration files) |
| `pnpm db:generate` | Generate SQL migration files in `lib/db/migrations/` |
| `pnpm db:studio` | Open Drizzle Studio (DB GUI in browser) |

---

## Project structure

```
.
├── app/
│   ├── actions/
│   │   ├── auth.ts            Sign-out server action
│   │   └── profile.ts         Profile / wallet server actions
│   ├── api/
│   │   ├── auth/[...all]/     Better Auth catch-all route
│   │   ├── ppp/               PPP data API (GET)
│   │   └── transactions/      Transactions API (GET, POST)
│   ├── error.tsx              Per-route error boundary
│   ├── global-error.tsx       Root error boundary
│   ├── loading.tsx            Loading state
│   ├── not-found.tsx          404 page
│   ├── layout.tsx             Root layout (metadata, fonts, analytics)
│   ├── globals.css            Tailwind + custom styles
│   ├── page.tsx               Dashboard (auth-gated, force-dynamic)
│   ├── sign-in/page.tsx       Sign-in page
│   └── sign-up/page.tsx       Sign-up page
├── components/
│   ├── auth-form.tsx          Reusable sign-in / sign-up form (client)
│   └── ui/                    shadcn/ui components (Base UI style)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── label.tsx
├── lib/
│   ├── auth.ts                Better Auth server instance
│   ├── auth-client.ts         Better Auth client (for React)
│   ├── db/
│   │   ├── index.ts           Drizzle DB + Postgres pool
│   │   └── schema.ts          All table schemas
│   └── utils.ts               cn() class merger
├── public/                    Static assets (icons, placeholders)
├── components.json            shadcn/ui config
├── drizzle.config.ts          Drizzle Kit config
├── next.config.mjs            Next.js config
├── package.json
├── postcss.config.mjs         Tailwind v4 PostCSS config
├── tsconfig.json
├── vercel.json                Vercel project config
└── README.md                  ← you are here
```

---

## How auth works

1. **Sign up** → user hits `POST /api/auth/sign-up/email` (Better Auth catch-all route) → row inserted in `user` table → session cookie set → redirected to `/`.
2. **Sign in** → same flow against `/api/auth/sign-in/email`.
3. **Every page load** → server component calls `auth.api.getSession({ headers })` → reads the session cookie → looks up the `session` table → returns the user (or `null`).
4. **Sign out** → `app/actions/auth.ts` server action calls `auth.api.signOut` → cookie cleared → redirect to `/sign-in`.

All four tables (`user`, `session`, `account`, `verification`) are created automatically when you run `pnpm db:push`.

---

## Troubleshooting

### "Server Components render" error on first deploy

Open the page — the new `app/error.tsx` will show the **real** error message in your browser (not the redacted one). Common causes:

- `BETTER_AUTH_SECRET` not set in Vercel → check Project → Settings → Environment Variables.
- `DATABASE_URL` missing or wrong → test the connection string in Neon dashboard.
- Tables not created yet → run `pnpm db:push` against the prod DB, then redeploy.

### Cookies not sticking (sign-in appears to do nothing)

In production, cookies are set with `SameSite=Lax` by default. If you're embedding the app in an iframe (like v0 preview), you need `SameSite=None; Secure` — that's already handled in the dev config (`lib/auth.ts`), but in production you'd need to update the `trustedOrigins` list and possibly set `BETTER_AUTH_URL` explicitly.

### Build fails with "relation does not exist"

Schema not pushed. Run `pnpm db:push` and redeploy.

### Auth errors in Vercel logs

Check **Deployments → Logs** for the specific error. Most often it's `BETTER_AUTH_SECRET` mismatch between local and prod (just regenerate and update Vercel).

---

## Tech stack

- **Next.js 16.2** — App Router, Server Components, Server Actions
- **React 19.2** — Latest stable
- **Better Auth 1.6** — Email/password auth
- **Drizzle ORM 0.45** + **pg 8.22** — Postgres driver
- **Tailwind CSS 4** — Styling
- **shadcn/ui** ("base-nova" style) + **Base UI** primitives — Component library
- **TypeScript 5.7** — Type safety
- **pnpm** — Package manager

---

## License

Private project.
