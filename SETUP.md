# Setup Checklist

Follow these steps in order. Each one has a checkbox so you can track progress.

## Local setup (one time)

- [ ] **Node.js 20+** installed (`node -v`)
- [ ] **pnpm** installed (`npm i -g pnpm`)
- [ ] **Neon account** at [neon.tech](https://neon.tech) (free tier is fine)
- [ ] Copy `.env.example` → `.env.local` and fill in `DATABASE_URL` + `BETTER_AUTH_SECRET`
- [ ] `pnpm install`
- [ ] `pnpm db:push` (creates the 8 tables)
- [ ] `pnpm dev` (verify it runs on http://localhost:3000)
- [ ] Sign up a test user locally, confirm dashboard renders

## Deploy to Vercel (one time)

- [ ] Push the repo to GitHub
- [ ] Import the repo in Vercel (**Add New Project**)
- [ ] In Vercel → **Storage** → **Connect Store** → **Neon** (this auto-injects `DATABASE_URL`)
- [ ] In Vercel → **Settings** → **Environment Variables**, add:
  - [ ] `BETTER_AUTH_SECRET` = output of `openssl rand -base64 32`
  - [ ] *(Optional)* `BETTER_AUTH_URL` = `https://your-app.vercel.app` (only if baseURL doesn't auto-resolve)
- [ ] Click **Deploy**
- [ ] After first deploy, locally with **prod** `DATABASE_URL` in `.env.local`: `pnpm db:push`
- [ ] Trigger a **Redeploy** in Vercel
- [ ] Visit the live URL, sign up a test user, confirm it works

## After setup

- [ ] Bookmark the Neon dashboard to monitor your DB
- [ ] Bookmark the Vercel dashboard to monitor deployments
- [ ] (Optional) Add a custom domain in Vercel → **Settings** → **Domains**

---

**If anything goes wrong**, open the failing page — the new `app/error.tsx` will display the actual error message in your browser. Screenshot it for debugging.
