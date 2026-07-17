# Deploy to Vercel — Quick Reference

## TL;DR

1. Push to GitHub
2. Import in Vercel
3. Add `DATABASE_URL` (via Neon integration) and `BETTER_AUTH_SECRET` (manual)
4. Deploy
5. Run `pnpm db:push` against the prod DB
6. Redeploy

## Detailed steps

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

### 2. Import in Vercel

Go to [vercel.com/new](https://vercel.com/new), select your GitHub repo, click **Import**.

Vercel auto-detects Next.js — no framework config needed.

### 3. Connect Neon (recommended)

**Before clicking Deploy**, in the Vercel import screen:

1. Click **Storage** → **Connect Store** → **Browse Storage** → **Neon**
2. Either create a new Neon project or link an existing one
3. Vercel will auto-add `DATABASE_URL` to the project

### 4. Add `BETTER_AUTH_SECRET` manually

Generate the value:

```bash
openssl rand -base64 32
```

In Vercel → **Settings** → **Environment Variables**:

- **Name:** `BETTER_AUTH_SECRET`
- **Value:** (paste the output of the command above)
- **Environment:** select all (Production, Preview, Development)

### 5. Deploy

Click **Deploy**. First build takes ~1-2 minutes.

### 6. Push the database schema

This is the step people forget. After the first deploy succeeds, you still need to create the tables in Neon.

Locally, temporarily set your **prod** `DATABASE_URL` in `.env.local`:

```bash
# .env.local
DATABASE_URL=postgresql://...your-neon-prod-url...
```

Then run:

```bash
pnpm db:push
```

You'll see Drizzle print something like:

```
[✓] user
[✓] session
[✓] account
[✓] verification
[✓] profiles
[✓] wallets
[✓] transactions
[✓] ppp_data
```

### 7. Redeploy

Now that the tables exist, trigger one more deploy so Vercel re-reads any cached state:

Vercel → **Deployments** → click the **⋯** on the latest → **Redeploy**.

### 8. Test

Visit `https://your-app.vercel.app`:

- Click **Sign up**
- Enter an email and password (min 8 chars)
- You should be redirected to the dashboard
- Sign out and sign back in — should work

---

## Environment variables — what's actually used

This app only reads these env vars at runtime:

| Var | Required | Set by |
|-----|----------|--------|
| `DATABASE_URL` | yes | Neon integration (auto) |
| `BETTER_AUTH_SECRET` | yes | You (manual) |
| `BETTER_AUTH_URL` | no | Auto-falls back to Vercel URL |
| `VERCEL_URL` | no | Vercel (auto) |
| `VERCEL_PROJECT_PRODUCTION_URL` | no | Vercel (auto) |
| `NODE_ENV` | no | Vercel (auto, set to `production`) |

**Anything else you've seen mentioned (JWT, Stellar, Pesapal, SendGrid, AWS, Supabase, Sentry, etc.) is from a previous version of this app and is NOT used.**

If your deployment platform prompts you for any of those, you can safely skip them or set them to empty strings.

---

## Continuous deployment

Once set up, every `git push` to `main` auto-deploys to production. Preview deployments are created for every PR.

To disable auto-deploy: **Settings** → **Git** → uncheck the production branch.
