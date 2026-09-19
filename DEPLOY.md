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

## Backups (do this before the first paying client)

Railway's built-in backups need the Pro plan. The cheaper route is to move the database to Neon, which includes daily backups and point-in-time restore on its free and launch tiers. The API does not care where Postgres lives; only `DATABASE_URL` changes.

1. Create an account at neon.tech. New project: name `oreset`, region closest to Railway's (pick a US or EU region matching your Railway service), Postgres 16.
2. Copy the pooled connection string from the Neon dashboard (it ends in `?sslmode=require`).
3. Export the current data from Railway: in the Railway Postgres service, open Data → Connect, copy its connection string, then on your machine run `pg_dump "<railway url>" --no-owner --no-acl -Fc -f oreset.dump` and `pg_restore -d "<neon url>" --no-owner --no-acl oreset.dump`. If you do not have `pg_dump` locally, install PostgreSQL client tools or ask George to run it.
4. On the Railway API service, Variables: replace `DATABASE_URL` with the Neon string (keep the old one noted somewhere safe for a week).
5. Redeploy the API. Watch the deploy log for "Migrations complete" and check `/health`.
6. Sign in and confirm People, Clients and Leads look the same as before.
7. In Neon: Settings → enable a 7-day (or longer) history for point-in-time restore. Write the date in the Decision Log.
8. After a week with no problems, delete the Railway Postgres service so nobody points at stale data by mistake.

Restore test (quarterly): in Neon, create a branch from a point in time, connect to it with `psql`, confirm recent rows exist. Note how long it took.

## If something breaks

Lessons from the first real deployment (19 September 2026), all hit and fixed:

- **Variables must go on the API service, not the Postgres service.** Click the API box before Variables. A key saved on the database box is silently ignored; the symptom was "Resend's email list stays empty".
- **Vercel shows "Needs Attention" on a variable** when the value has a trailing space or newline, which `openssl rand` output has. Re-paste the value with nothing after the last character.
- **Railway Watch Paths: one path per row, no brackets or quotes.** The API service must list `/apps/api/**`, `/packages/shared/**`, `/package.json` and `/pnpm-lock.yaml` as four separate rows. A JSON array pasted as a single row (`["/apps/api/**", "/packages/shared/**"]`) is treated as one literal path that matches nothing, so pushes to the API were silently ignored for a morning while the old build kept running.
- **To check which build is live**, send an empty application: `curl -s -X POST https://api.oreset.africa/api/v1/operators/apply -H "Content-Type: application/json" -d '{}'`. The `fieldErrors` list shows the fields the running code expects; compare with `applySchema` in `apps/api/src/modules/operators/operators.controller.ts`.
- **pnpm version is pinned** (`packageManager` in the root `package.json`, and the Dockerfile). Do not bump one without the other and the lockfile.
- **Set `MAIL_FROM` to a real mailbox** you read, for example `Oreset <info@oreset.africa>`, so replies land somewhere.

| Symptom | Likely cause |
|---|---|
| Green "Check your email" on the site but Resend's Emails list is empty | `RESEND_API_KEY` missing on the API service (check it is not on the Postgres box), or the reset was for an email that has no account |
| Green panel, Resend shows the email with a red status | Domain not yet Verified in Resend; add its DNS records at Namecheap |
| Site loads, sign-in says "Sign-in failed" with no detail | `CORS_ORIGINS` does not include the exact site origin, or `NEXT_PUBLIC_API_URL` is wrong |
| Sign-in succeeds then bounces straight back to sign-in | `ACCESS_TOKEN_SECRET` differs between Vercel and Railway, or `COOKIE_DOMAIN` is wrong, or the API is not on `api.oreset.africa` |
| Deploy log shows `Migration failed` | Read the message above it; usually `DATABASE_URL` reference missing |
| A form says "The server asked for answers this form does not have" | Website is newer than the API. Railway did not deploy the latest commit; check Watch Paths (one path per row) and Deployments |
| `/health` works, everything else 500s | Check Variables for a missing required secret; the API refuses to start with invalid config and says which |

## Local development is unchanged

`pnpm dev` still runs both apps against your local Postgres. Nothing in this guide changes that.
