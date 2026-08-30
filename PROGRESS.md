# Oreset: Project Progress and Roadmap

Last updated: 2026-08-30

## What Oreset Does

Oreset is an independent AI decision verification platform for African languages. When AI systems (claims processors, credit scorers, triage bots, government chatbots) make decisions based on input in Yoruba, Hausa, Pidgin, Igbo, Swahili, or other African languages, Oreset checks whether those decisions were actually correct.

Two things are verified separately:
1. **Did the AI understand what was said?** (language comprehension)
2. **Was the decision that followed correct?** (outcome evaluation)

Business model: $15-25 per case, sold to enterprises shipping AI products into African markets. Currently pre-revenue, Stage 1, focused on fintech (claims, lending).

---

## Architecture

**Monorepo** with three packages:

| Package | Stack | Purpose |
|---------|-------|---------|
| `apps/web` | Next.js 16, React 19, Tailwind v4, shadcn/ui | All frontends (marketing site, dashboards) |
| `apps/api` | Express.js, Drizzle ORM, PostgreSQL | REST API with JWT cookie auth |
| `packages/shared` | TypeScript | Shared enums, types, constants |

**Deployment:** Vercel (web), domain: oreset.africa

---

## What's Built

### Marketing Site (`/`)

Single-page site with all sections rendered in sequence:
- Hero with CTA ("Verify a Decision")
- How Verification Works (5-step engine)
- Why Now (Africa-specific AI gap)
- Three Paths In (Contribute / Get Certified / Verify a Decision)
- FAQ
- Pilot Scoping Modal (lead capture)

**Solution pages** (4 verticals):
- `/solutions/claims` — Insurance claims processing
- `/solutions/lending` — Credit scoring and loan decisions
- `/solutions/healthcare` — AI triage and symptom checkers
- `/solutions/government` — Eligibility screeners and chatbots

### Contributor Dashboard (`/capture`)

For field data collectors (speech, image, text):
- Home with active campaigns and stats
- Batch assignment and submission flow
- On-device recording with consent gates and quality validation
- Submission history and payout tracking
- Privacy policy page
- Account/profile management

### QA Reviewer Dashboard (`/qa`)

For Oreset's internal quality reviewers (checking collected data before packaging):
- Queue of submissions awaiting review
- Review interface with approve/reject decisions
- Review history with approval rate stats

### Operator (Certified Reviewer) Dashboard (`/operator`)

For certified reviewers checking live enterprise client AI output:

**Home** (`/operator/home`)
- Profile telemetry bar: name, languages, verification status, metrics
- Onboarding checklist: profile completion, identity verification, agreements
- Stats: reviewed today, all-time, approval rate
- Recent decisions feed

**Queue** (`/operator/queue`)
- Pending items with domain, language, input type badges
- Distinguishes "Trace Unit" (rich data) vs "Transcript" (text-only) cards
- RBAC language-based prioritization (language-matched items appear first)

**Review Workspace** (`/operator/item`)
- **Dual-pane layout** for trace units: media panel (left) + evaluation panel (right)
- **4 input types supported:**
  - Audio: play/pause, seek, speed control (0.75x-1.5x)
  - Text: side-by-side original vs AI interpretation
  - Document: image viewer with zoom/rotate
  - Conversation: threaded message view with role-colored messages
- **2-step rubric evaluation:**
  - Step 1: Understanding Check (accuracy rating + misread phrases)
  - Step 2: Outcome Evaluation (verdict + severity + evidence summary)
- **5 decision actions:** Approve, Correct & Pass, Reject & Flag, Escalate, Decline
- **Error tagging:** ERR-01 through ERR-04 (phonetic clipping, intent misparsing, outcome mismatch, dialect over-refusal)
- **Severity levels:** SEV-1 (Critical), SEV-2 (Major), SEV-3 (Minor)
- **Ground-truth corrections:** corrected transcript, intent, outcome fields
- **Review timer** with auto-pause on 5-minute idle
- **Keyboard shortcuts:** 1-5 for decisions, Enter to submit, Esc to cancel
- Legacy text-only review for items without trace data

**History** (`/operator/history`)
- Full decision history with 6-way filter (all, approved, corrected, rejected, escalated, declined)

**Calibration** (`/operator/calibration`)
- Gold-standard practice cases with known correct answers
- Decision selection, error tagging, severity picking
- Instant scored feedback after each attempt (pass/fail with explanation)
- Running stats: pass count, average score
- Full attempt history

**Settings** (`/operator/settings`)
- Profile tab (languages, location, dialect, availability)
- Identity verification (document upload)
- Agreements (NDA, Code of Conduct, Data Handling Policy)
- Payout details (bank info)

**Foundry** (`/operator/foundry`)
- Initial certification: training on Pacing, Clarity, Spontaneity standards
- Quiz with instant feedback
- Certification gate before accessing queue

### Admin Dashboard (`/admin`)

**Home** (`/admin/home`) — Overview stats

**Campaigns** (`/admin/campaigns`) — Create and manage data collection campaigns (multi-step wizard: parameters, materials, cohort, pay rate, launch)

**Datasets** (`/admin/datasets`) — Package and deliver verified data to buyers

**Tickets / Escalation Queue** (`/admin/tickets`)
- Cases escalated by operators for ambiguous context, novel slang, unclear policy
- Stats bar: open, resolved, total
- Expandable cards: error classification, original content, operator notes, corrections, resolution
- Resolve action for admins

**Regressions** (`/admin/regressions`)
- Auto-generated CI/CD test cases from rejected and corrected decisions
- Stats: total cases, rejected, corrected, client count
- Client filter dropdown
- Expandable test case cards: source input, model output, ground truth, error taxonomy
- Download buttons: JSON and JSONL formats

**Calibration** (`/admin/calibration`)
- Stats: active cases, total attempts, pass rate, average score
- Operator performance leaderboard table
- Gold-standard case management: create, view, retire
- Full case detail with expected answer and explanation

**Consensus / Dual-Solve** (`/admin/consensus`)
- Stats: total pairs, agreement rate, Cohen's kappa, pending adjudication count
- Breakdown: agreed, disagreed, adjudicated counts
- Kappa interpretation guide (slight/fair/moderate/substantial/perfect)
- Side-by-side adjudication queue: both reviewer decisions shown, admin picks final decision
- Bulk enable dual-solve on all pending items

**Other admin pages:**
- Applications — Operator application review
- Payouts — Contributor payout management and batch processing
- Audit Log — System audit trail
- Batches — Data batch management

### Buyer Dashboard (`/buyer`)

For enterprise clients purchasing verified data:
- Home with delivered dataset inventory
- Dataset browser with download
- Activity feed

### API Modules

| Module | Purpose |
|--------|---------|
| `auth` | Phone/OTP login, JWT sessions |
| `operator` | Queue, decisions, profile, verifications, agreements, payouts |
| `ingestion` | Trace unit ingestion (single/batch), API key auth, regression export |
| `calibration` | Gold-standard cases, operator attempts, scoring, stats |
| `consensus` | Dual-solve pairs, adjudication, agreement stats, Cohen's kappa |
| `tickets` | Escalation queue CRUD |
| `admin` | Overview, regression export (staff auth) |
| `qa` | Internal QA review queue and decisions |
| `campaigns` | Campaign CRUD |
| `batches` | Batch management |
| `submissions` | Contributor submission handling |
| `datasets` | Dataset packaging and delivery |
| `buyers` | Buyer-facing dataset access |
| `payouts` | Payout calculation and processing |
| `consent` | Digital consent records |
| `uploads` | File upload handling |
| `validation` | Automated quality validation |
| `retention` | Data retention/cleanup |
| `audit` | Audit log |

### Database (21+ tables)

Key tables: users, sessions, campaigns, batches, submissions, operator_review_decisions, client_queue_items, client_tickets, calibration_cases, calibration_attempts, consensus_pairs, identity_verifications, operator_agreements, datasets, dataset_items, payouts, audit_log

12 migrations applied (0001 through 0012).

---

## What's Next

### Immediate (ready to build)

- **Operator performance dashboard (admin)**: Per-operator metrics over time, calibration score trends, review speed, accuracy rates
- **Client-facing portal**: Enterprise clients can submit cases, track status, view results, download regression suites (currently API-only via ingestion endpoints)

### Medium-term

- **Batch operations**: Bulk case submission and bulk result export for enterprise clients
- **Webhook notifications**: Notify client systems when case review is complete
- **Real-time queue**: WebSocket or SSE for live queue updates instead of page refresh
- **Reviewer matching algorithm**: Beyond language, match by domain experience, calibration score, and past accuracy on similar case types
- **Payment integration**: Wire payout processing to actual payment rails (currently data-only)
- **Mobile-optimized review interface**: Operators reviewing on phone/tablet

### Long-term

- **Multi-language dashboard**: Admin and operator dashboards localized for non-English reviewers
- **Automated pre-screening**: Run basic automated checks before human review to triage obvious passes/failures
- **Analytics and reporting**: Client-facing dashboards with trends, error patterns, and model improvement recommendations
- **API v2**: GraphQL or improved REST with pagination, filtering, webhook subscriptions
- **SOC 2 / compliance**: Audit trail hardening, data residency controls, access logging

---

## Key Decisions Made

1. **Separate understanding from outcome** — Two-step rubric, not a single pass/fail. A model can understand perfectly and still decide wrong (or vice versa).

2. **5 decision actions, not 2** — Approve, Correct & Pass, Reject & Flag, Escalate, Decline. Nuance matters when the consequence is a denied claim or a missed diagnosis.

3. **RBAC via language prioritization, not filtering** — Operators see all pending items but language-matched ones appear first. No cases get stuck because of a narrow filter.

4. **Regression tests auto-generated** — Every rejection or correction automatically becomes a CI/CD test case. Clients get a growing test suite without extra work.

5. **Calibration before production** — Operators practice on gold-standard cases with instant feedback before touching live data. Scores are tracked and visible to admins.

6. **Custom DOM events over global state** — Cross-component communication uses `oreset:open-pilot`, `oreset:scroll-stop`, `oreset:scroll-start` events rather than Redux or Zustand.

7. **GSAP over Framer Motion** — ScrollTrigger-driven animations with Lenis smooth scrolling for the marketing site. All animation respects `prefers-reduced-motion`.
