import { defineConfig } from '@playwright/test'

// Prerequisites (documented in e2e/README.md): docker compose up -d,
// pnpm db:migrate, pnpm db:seed, then both apps/api and apps/web dev
// servers running — this config assumes they're already up rather than
// managing their lifecycle itself, since apps/api additionally needs a
// migrated + seeded database before it's useful.
export default defineConfig({
  testDir: './e2e',
  // Generous timeouts: Next dev (Turbopack) compiles each route on first
  // visit, which can take several seconds — a real characteristic of dev
  // mode, not app slowness. Discovered by actually running these specs:
  // the default 5s expect timeout intermittently failed on a route's
  // first-ever navigation in the run.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  // Every spec shares one real Postgres database (no per-worker isolation
  // like apps/api's Vitest suite has) — force one worker so specs never
  // race each other's seeded/arranged data.
  workers: 1,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    navigationTimeout: 15_000,
    actionTimeout: 15_000,
  },
})
