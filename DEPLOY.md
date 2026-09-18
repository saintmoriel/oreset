# Deploying Oreset

Two pieces. The website (`apps/web`) already runs on Vercel at oreset.africa. This guide puts the API (`apps/api`) and its database on Railway at `api.oreset.africa`, then points the website at it.

Time: about 45 minutes the first time. Cost: roughly $5 to $10 a month at current scale.

**Why the API must be on `api.oreset.africa` and not a random hostname:** sign-in works by setting a cookie for `oreset.africa`. Browsers only send that cookie to the API if the API is on the same domain. A `something.up.railway.app` address would make sign-in fail with no visible error.

---

## Part 1: Railway (API and database)

1. Go to railway.app and sign in with GitHub.
2. **New Project → Deploy from GitHub repo** → choose `saintmoriel/oreset`. Railway creates a service from the repo.
3. Open the service → **Settings**:
   - **Root Directory**: leave empty (the repository root).
   - **Build**: set **Dockerfile Path** to `apps/api/Dockerfile`.
   - **Networking**: click **Generate Domain** for now (temporary, we replace it in Part 2). Set the port to `4000` if asked.
4. In the project, click **+ New → Database → PostgreSQL**. Railway creates it and exposes `DATABASE_URL`.
5. Back in the API service → **Variables**. Add these. Where it says generate, run `openssl rand -base64 48` in any terminal (Git Bash works) and paste the output.

| Variable | Value |
|---|---|
| `DATABASE_URL` | click **Add reference** and pick the Postgres service's `DATABASE_URL` |
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `ACCESS_TOKEN_SECRET` | generate. **Copy it somewhere: Vercel needs the identical value.** |
| `REFRESH_TOKEN_SECRET` | generate (a different one) |
| `COOKIE_DOMAIN` | `oreset.africa` |
| `CORS_ORIGINS` | `https://oreset.africa,https://www.oreset.africa` |
| `API_PUBLIC_URL` | `https://api.oreset.africa` |
| `WEB_PUBLIC_URL` | `https://oreset.africa` |
| `BOOTSTRAP_ADMIN_EMAIL` | your email. Creates your admin account on first start. |
| `BOOTSTRAP_ADMIN_NAME` | your name |
| `RESEND_API_KEY` | from resend.com once you have verified the domain (optional at first; without it, emails are logged, not sent) |
| `MAIL_FROM` | `Oreset <hello@oreset.africa>` |
| `LEADS_NOTIFY_EMAIL` | where new website leads should be announced |
| `STORAGE_PROVIDER` | `local` |
| `PAYMENT_PROVIDER` | `dev-stub` |

6. Click **Deploy**. Watch **Deployments → View logs**. You want to see, in order: `Migrations complete.`, then a boxed `[bootstrap-admin] Temporary password: ...` line, then the server listening. **Copy that password now; it is printed once.**
7. Test: open `https://<your-generated-domain>/health`. You should see `{"ok":true}`.

---

## Part 2: Domain (api.oreset.africa)

1. In the Railway service → **Settings → Networking → Custom Domain** → enter `api.oreset.africa`. Railway shows a CNAME target like `xxxx.up.railway.app`.
2. At your DNS provider (wherever oreset.africa is managed; the same place you pointed it at Vercel): add a **CNAME** record, name `api`, value the target Railway gave you. TTL default.
3. Wait a few minutes. Railway shows a green tick when the certificate is issued. `https://api.oreset.africa/health` should return `{"ok":true}`.
4. You can now delete the generated `*.up.railway.app` domain in Railway. Keeping it is harmless but it will not work for sign-in.

---

## Part 3: Vercel (point the website at the API)

1. Vercel → your project → **Settings → Environment Variables**. Add for **Production**:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.oreset.africa` |
| `ACCESS_TOKEN_SECRET` | **the exact same value you set on Railway.** The website checks sign-in cookies with it. If they differ, every page bounces to sign-in. |

2. **Deployments → Redeploy** the latest production deployment (environment variables only apply to new builds).
3. Test the whole thing: open https://oreset.africa/admin, sign in with your email and the bootstrap password. Then go straight to **Forgot password** and set a real one.

---

## After the first deploy

- **Every push to `main` redeploys both** (Vercel for the site, Railway for the API). Migrations run automatically on API start.
- **Create people from the product, not the database.** People page for staff, Clients page for clients. Testers apply through the site.
- **Do not run `db:seed:redteam` against production.** It creates demo accounts with a public password. It is for local development only.
- **Logs**: Railway → service → Deployments → View logs. Emails appear there as `[mail:not-sent]` until `RESEND_API_KEY` is set.
- **Database backups**: Railway → Postgres service → Backups. Turn on daily backups before the first real client.

## If something breaks

| Symptom | Likely cause |
|---|---|
| Site loads, sign-in says "Sign-in failed" with no detail | `CORS_ORIGINS` does not include the exact site origin, or `NEXT_PUBLIC_API_URL` is wrong |
| Sign-in succeeds then bounces straight back to sign-in | `ACCESS_TOKEN_SECRET` differs between Vercel and Railway, or `COOKIE_DOMAIN` is wrong, or the API is not on `api.oreset.africa` |
| Deploy log shows `Migration failed` | Read the message above it; usually `DATABASE_URL` reference missing |
| `/health` works, everything else 500s | Check Variables for a missing required secret; the API refuses to start with invalid config and says which |

## Local development is unchanged

`pnpm dev` still runs both apps against your local Postgres. Nothing in this guide changes that.
