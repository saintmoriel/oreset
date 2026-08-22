# E2E tests (Playwright)

Real specs, driving a real Chromium browser against the real running stack —
not pseudocode. **Update, 2026-08-19**: earlier phases repeatedly assumed no
headless browser tooling existed in this environment (every phase's
"Actually verified" section says so). That assumption turned out to be
wrong — Chromium actually launches here (`npx playwright install chromium`
+ a smoke-test page load both worked). These specs were written **and
actually run** against the real dev stack; see the Phase 6 plan section for
the real pass/fail result.

## Prerequisites

```
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm dev:api    # in one terminal
pnpm dev:web    # in another
```

`apps/web/.env.local` must point at the real running API
(`NEXT_PUBLIC_API_URL=http://localhost:4001`) and carry the same
`ACCESS_TOKEN_SECRET` as `apps/api/.env` — `proxy.ts` verifies the JWT
signature itself, so a mismatched secret bounces every gated route to
sign-in with no useful error.

Then: `pnpm test:e2e` (from the repo root).

## Scope

Golden-path coverage for four personas' real browser flows, using the
seeded dev accounts. A couple of specs arrange their own fixture data via
Playwright's `request` API context (a real HTTP call to the real API, just
not through the browser UI) rather than the app's own UI, where driving the
UI to that state would be disproportionately complex for what it proves —
e.g. producing a `validated` (not `qa_approved`) submission for the QA spec
without duplicating the whole capture flow.

**Deliberately out of scope**: a full contributor capture-and-submit E2E
(record audio → upload → validate) needs `getUserMedia`/`MediaRecorder`
fakery (`--use-fake-device-for-media-stream` launch args, plus mocking the
recorder's blob output) that's a meaningfully harder, separate problem from
everything else in this pass. `contributor-signin.spec.ts` covers the
single most consequential previously-unverified piece instead — the real
OTP sign-in and the cross-origin cookie round trip between `localhost:3000`
and `localhost:4001` that `proxy.ts` depends on, which no phase had ever
actually proven in a real browser before now.
