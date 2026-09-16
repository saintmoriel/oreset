# Dashboard Adaptation Spec: AI Agent Red-Teaming

**Status:** Step 1 complete. Step 2 next.
**Date:** 2026-09-07

---

## Overview

We are adapting the three existing portals (Operator, QA, Buyer) from language-verification dashboards to AI agent red-teaming and vulnerability triage consoles. There is no production data to migrate, so this is a clean swap.

The existing architecture (dual-pane layout, queue mechanics, consensus system, webhook infrastructure, export pipelines) stays intact. What changes is the **taxonomy** (what the fields mean), the **review form** (what testers fill out), and the **QA workflow** (from data quality gate to lead auditor console).

### Decisions from Synack/Cobalt Analysis

These are folded into the relevant steps below:

- **Free retesting / patch verification** baked into every tier. Finding lifecycle: discovered, verified, fix submitted, retested, closed.
- **Platform is the deliverable**, not a single PDF. Client lives in the dashboard with streaming findings, severity trends, progress tracking.
- **Multiple touchpoints per engagement**: kickoff, mid-engagement check-in, final readout, post-fix retest cycle.
- **Executive summary generated from platform**, not written separately.
- **CI/CD regression export** positioned as AI agent regression testing.
- **Webhook mention on landing page**: "integrates with your existing tools via webhooks."
- **Slack integration** is a Stage 2 priority (5+ paying clients).

---

## Step 1: Replace the Shared Taxonomy [COMPLETE]

All backend code updated. Migration `0016_taxonomy_swap_redteam.sql` ready to run.

### Summary of changes

| Area | Old | New |
|------|-----|-----|
| Error tags | ERR-01 to ERR-04 | VLN-01 to VLN-06 (OWASP LLM Top 10) |
| Severity | SEV-1 to SEV-3 | P0 to P3 |
| Operator decisions | approved, corrected, rejected, escalated, declined | exploited, defended, escalated, inconclusive |
| QA/Auditor decisions | approved, rejected | verified, false_positive, severity_adjusted |
| New field | n/a | exploit_status (exploit_successful, partial_bypass, defended) |
| New field | n/a | reproduction_steps (text) |
| New field | n/a | recommended_fix (text) |
| New table | n/a | verified_findings (lead auditor workflow) |
| Calibration | ERR tags + correctedOutcome | VLN tags + exploit_status + reproduction_steps |

### Files changed

- `packages/shared/src/enums.ts`
- `apps/api/src/db/schema/enums.ts`
- `apps/api/src/db/schema/operator-review-decisions.ts`
- `apps/api/src/db/schema/consensus-pairs.ts`
- `apps/api/src/db/schema/client-tickets.ts`
- `apps/api/src/db/schema/calibration.ts`
- `apps/api/src/db/schema/verified-findings.ts` (new)
- `apps/api/src/db/schema/relations.ts`
- `apps/api/src/db/schema/index.ts`
- `apps/api/src/modules/operator/operator.controller.ts`
- `apps/api/src/modules/operator/operator.service.ts`
- `apps/api/src/modules/consensus/consensus.controller.ts`
- `apps/api/src/modules/consensus/consensus.service.ts`
- `apps/api/src/modules/buyers/buyers.controller.ts`
- `apps/api/src/modules/buyers/buyers.service.ts`
- `apps/api/src/modules/calibration/calibration.controller.ts`
- `apps/api/src/modules/calibration/calibration.service.ts`
- `apps/api/src/modules/admin/admin.service.ts`
- `apps/api/src/modules/ingestion/ingestion.service.ts`
- `apps/web/components/admin/calibration-manager.tsx`
- `apps/web/lib/api/endpoints/calibration.ts`

---

## Step 2: Rebuild the Operator Review Form

### Priority: This is the most important change.

### Current architecture (what exists today)

The `/operator/item` page has two code paths:

1. **`ReviewerWorkspace`** for trace-unit items. Dual-pane layout with a two-step locked form:
   - Step 1 (`StepUnderstanding`): Interpretation accuracy, key phrases misread, template fields
   - Step 2 (`StepOutcome`): Verdict, severity 1-5, evidence summary
2. **`LegacyReviewItem`** flat form with 5 decision buttons + error tags + corrections

### What it becomes

Replace both paths with a single **`VulnerabilityReviewWorkspace`** component.

#### Left Pane: Exploit Trace Window

Shows the attack scenario the tester is evaluating. Data comes from `traceData` (JSON blob on `client_queue_items`).

| Field | Source | Display |
|-------|--------|---------|
| Target endpoint | `traceData.targetEndpoint` | Monospace badge, e.g., `POST /v1/agent/chat` |
| Attack prompt | `traceData.input` | Full text in a highlighted card |
| Attack type | `traceData.attackType` | Badge (e.g., "Direct injection", "Parameter splitting") |
| Model response | `traceData.aiDecision` | Full text, different background |
| Tool calls executed | `traceData.toolCalls` | List of function calls with arguments, color-coded (red if unauthorized) |
| Agent reasoning | `traceData.aiOutcome` | Collapsible section |
| Domain context | `traceData.domain` | Badge |
| Test scenario ID | `externalRef` | Monospace |

**New traceData fields to add** (extend the JSON schema, not the DB columns):

```typescript
type TraceData = {
  // Existing
  domain?: string
  scope?: string
  language?: string
  input?: string          // becomes: the attack prompt
  aiDecision?: string     // becomes: the model's response
  aiOutcome?: string      // becomes: agent reasoning / chain-of-thought
  decisionCriteria?: string
  isDualSolve?: boolean
  isGoldStandard?: boolean
  // New
  targetEndpoint?: string
  attackType?: string
  toolCalls?: { function: string; args: Record<string, unknown>; authorized: boolean }[]
  systemPrompt?: string   // redacted version for tester context
  modelId?: string
}
```

#### Right Pane: Vulnerability Assessment Form

Single form (no step-locking). Fields:

1. **Vulnerability Category** dropdown, required
   - VLN-01: Prompt Injection
   - VLN-02: Sensitive Data Disclosure
   - VLN-03: Excessive Agency
   - VLN-04: Guardrail Bypass
   - VLN-05: Hallucinated Business Action
   - VLN-06: Unsafe Decision Under Ambiguity

2. **Exploit Status** radio group, required
   - Exploit successful
   - Partial bypass
   - Defended / safe

3. **Severity** dropdown, required when exploit is successful or partial
   - P0: Critical
   - P1: High
   - P2: Medium
   - P3: Low

4. **Reproduction Steps** textarea, required when exploit is successful or partial
   - Placeholder: "Describe step-by-step how you triggered this failure."

5. **Recommended Fix** textarea, optional
   - Placeholder: "What guardrail, prompt change, or code fix would prevent this?"

6. **Decision** derived automatically:
   - If exploit status = "Defended" then decision = `defended`
   - If exploit status = "Exploit successful" then decision = `exploited`
   - If exploit status = "Partial bypass" then decision = `exploited` (with P2/P3 severity likely)

7. **Escalate toggle** overrides to `escalated` if tester is unsure

8. **Review timer** keep as-is (`ReviewTimer` component)

#### Submit payload (what hits the API)

```typescript
{
  decision: 'exploited' | 'defended' | 'escalated' | 'inconclusive'
  vulnTag: 'VLN-01' | 'VLN-02' | 'VLN-03' | 'VLN-04' | 'VLN-05' | 'VLN-06'
  severity: 'P0' | 'P1' | 'P2' | 'P3'
  exploitStatus: 'exploit_successful' | 'partial_bypass' | 'defended'
  reproductionSteps: string
  recommendedFix?: string
  reviewTimeMs: number
}
```

---

## Step 3: Rebuild QA as Lead Auditor Console

### What it becomes

The QA console becomes the **Lead Auditor Console** where findings are verified before they go into the client report.

#### What the lead auditor sees in their queue

Items enter the auditor queue when:
- A tester marks an exploit as `exploited` with P0 or P1 severity (auto-routes for verification)
- A dual-solve pair reaches `consensus_split` (disagreement)
- A tester explicitly escalates

#### What the auditor does

For each finding:

1. **Review the exploit trace** (same left-pane view as the tester saw)
2. **Review the tester's assessment** (vulnerability category, severity, reproduction steps)
3. **Verify reproducibility** can they reproduce the attack? (Yes/No toggle + notes)
4. **Assess blast radius** free-text field: "If exploited in production, what is the business consequence?"
5. **Take action:**
   - **Verify** finding is real. Locks it into the client report.
   - **Adjust severity** finding is real but tester got the severity wrong. Auditor corrects.
   - **Reject as false positive** finding was a fluke. Does not appear in client report.

#### DB table: `verified_findings` [COMPLETE]

Already created in Step 1 migration.

#### New API endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/findings/queue` | staff:admin, staff:reviewer_lead | Findings pending verification (P0/P1 exploits + escalations) |
| GET | `/api/v1/findings/:decisionId` | same | Single finding detail |
| POST | `/api/v1/findings/:decisionId/verify` | same | Verify, reject, or adjust a finding |
| GET | `/api/v1/findings/stats` | same | Verification stats |
| GET | `/api/v1/buyer/findings` | buyer | Client findings + resilience score + breakdowns |
| POST | `/api/v1/buyer/findings/:id/fixed` | buyer | Mark fixed, queues a free retest scenario |

Built as `apps/api/src/modules/findings/`. Retest outcomes are applied from `operator.service.decide` when the scenario carries `traceData.retestOf`.

#### Frontend

New page: `/admin/findings` inside the admin shell. Lead auditors already live in the admin portal via the `reviewer_lead` role, and the old QA portal stays hidden.

Layout: Same dual-pane as operator workspace, but right pane shows:
- Tester's original assessment (read-only summary)
- Reproducibility toggle
- Blast radius text field
- Verdict buttons (Verify / Adjust / Reject)
- Severity override dropdown (shown when "Adjust" is selected)
- Auditor notes

---

## Step 4: Upgrade Buyer/Client Portal

### Key principle: The platform IS the deliverable

No single PDF report. The client dashboard shows real-time findings as they are confirmed. Findings stream in as operators confirm them, not batched at the end. Each finding has its own lifecycle: discovered, verified, remediation recommended, fix submitted, retested, closed.

### New dashboard elements

#### 1. Agent Resilience Score

Computed from verified findings:
- Start at 100
- P0 finding: -25 points
- P1 finding: -15 points
- P2 finding: -8 points
- P3 finding: -3 points
- Floor at 0

Display: Large circular score gauge with label:
- 90 to 100: "Production Ready"
- 70 to 89: "Needs Remediation"
- 50 to 69: "Significant Risk"
- 0 to 49: "Do Not Deploy"

#### 2. Vulnerability Breakdown

Bar chart or stacked badges showing count by category:
- e.g., "2x Prompt Injection, 1x Excessive Agency, 3x Guardrail Bypass"

Also by severity: "2 Critical (P0), 3 High (P1), 5 Medium (P2)"

#### 3. Blast Radius Map

If `traceData.toolCalls` is populated, show a table of tool functions tested:

| Tool Function | Status | Finding |
|---------------|--------|---------|
| `transfer_funds` | Vulnerable | VLN-03, P0 |
| `check_balance` | Secure | n/a |
| `read_user_data` | Vulnerable | VLN-02, P1 |

#### 4. Findings List (replaces "Cases" list)

Each card shows:
- Attack scenario summary
- Vulnerability category badge
- Severity badge
- Exploit status
- Reproduction steps (expandable)
- Recommended fix
- Auditor verification status (verified / pending / false positive)
- Finding lifecycle state (discovered, verified, fix submitted, retested, closed)

#### 5. Executive Summary View

Auto-generated from platform data, not a separate document:
- Total findings by severity
- Top vulnerability categories
- Resilience score with trend
- Key recommendations (aggregated from recommended_fix fields)
- Engagement timeline (when testing started, when findings were verified)

#### 6. Export Updates

The regression suite export (`GET /api/v1/buyer/regressions`) already includes:
- `vulnTag` (vulnerability category)
- `severity` as P0 to P3
- `exploitStatus`
- `reproductionSteps`
- `recommendedFix`

Still to add:
- `blastRadius` (from auditor verified_findings)
- `verified` boolean
- `verifiedAt` timestamp

The CI/CD regression JSON format should be directly importable into GitHub Actions or similar. Position this as "AI agent regression testing: every time you deploy, run your agent against the attacks we already confirmed work."

#### 7. Webhook / Integration Mention

Landing page and client onboarding should mention:
- "Integrates with your existing tools via webhooks"
- Webhook events fire on finding confirmed, severity change, retest complete
- JSON/JSONL export for CI/CD pipelines

---

## Step 5: Engagement Model Decisions (from Synack / Cobalt benchmark)

These are product decisions, not just UI. They shape what the dashboards must support.

### 5.1 The platform is the deliverable, not a report

No single PDF handoff. The client dashboard is where findings live, and it must:

- Stream findings as the lead auditor verifies them (not batched at the end)
- Show a **resilience score** and its trend over the engagement, not a single snapshot
- Let the client filter, export, and share individual findings with their engineering team
- Generate the executive summary **from** platform data (a "Download summary" action), never written separately

### 5.2 Finding lifecycle with free retest

Every finding carries a state. Free retesting is included in every tier and is non-negotiable.

```
discovered → verified → fix_submitted → retesting → closed
                    ↘ false_positive (terminal)
                    ↘ reopened (retest failed, back to fix_submitted)
```

Schema impact:

- New enum `FINDING_STATUSES = ['discovered', 'verified', 'fix_submitted', 'retesting', 'closed', 'reopened', 'false_positive']`
- New columns on `verified_findings`: `status` (finding_status, default `verified`), `fixSubmittedAt`, `retestedAt`, `retestedBy` (FK users), `retestNotes`, `closedAt`
- New client action: **"Mark as fixed"** on a finding. Sets `status = fix_submitted`, routes it back into the operator queue as a retest item (new `traceData.retestOf` pointing at the original finding id)
- Operator retest decision: `defended` closes the finding, `exploited` reopens it with a note

### 5.3 Multiple touchpoints per engagement

Operational process, but the client dashboard should reflect engagement phase:

| Phase | Client sees |
|-------|-------------|
| Kickoff | Scope summary, attack surface list, expected timeline |
| Testing | Findings streaming in, resilience score updating |
| Readout | Executive summary available, prioritized fix list |
| Retest | Per-finding retest status, closure progress |

Add `engagementPhase` to the client's engagement record (new lightweight `engagements` table or a field on the buyer's org record; decide with George).

### 5.4 Developer hooks

- **Webhooks** (already built): keep as the primary integration path. Landing page copy: "integrates with your existing tools via webhooks."
- **CI/CD regression export** (already built): position as **AI agent regression testing**. Every confirmed exploit becomes a test case the client runs on every deploy. Add `verified`, `blastRadius`, and `status` to the export payload.
- **Slack notifications**: Stage 2, when there are 5+ paying clients. One-way alerts on finding verified and finding closed.
- **Jira / ServiceNow / Splunk**: not now. Build only when a signing client is blocked on it.

### 5.5 Copy rule

No em dashes or en dashes anywhere in user-facing text: labels, descriptions, enum labels, placeholders, empty states.

---

## Implementation Order

| Phase | What | Effort | Status |
|-------|------|--------|--------|
| 1a | Update `packages/shared/src/enums.ts` | Small | DONE |
| 1b | Write DB migration | Small | DONE |
| 1c | Update API Zod schemas + services | Medium | DONE |
| 1d | Update calibration schema + services | Small | DONE |
| 2a | Build `VulnerabilityReviewWorkspace` component | Large | NEXT |
| 2b | Update `/operator/item` to use new component | Medium | |
| 2c | Update operator home/history pages | Small | |
| 3a | Build auditor API endpoints | Medium | |
| 3b | Build `/admin/findings` page | Large | |
| 4a | Add resilience score to buyer home | Medium | |
| 4b | Update buyer cases list + detail | Medium | |
| 4c | Add executive summary view | Medium | |
| 4d | Update export formats with auditor data | Small | |

**Critical path:** 1 (done) then 2a then 2b (gets tester workspace working).

Everything else can happen in parallel after Step 2.

---

## What George Needs to Know

George owns the backend. Step 1 is done for him. Remaining scope:

1. **Run migration** `0016_taxonomy_swap_redteam.sql` against the database
2. **New auditor API endpoints** (Step 3a): `/api/v1/findings/*` for lead auditor verification, `/api/v1/buyer/findings` for the client dashboard
3. **Export updates** (Step 4d): Add `blastRadius`, `verified`, `verifiedAt` from verified_findings to regression export

## What Favor Needs to Know

Favor owns the frontend. Their scope:

1. **New component: `VulnerabilityReviewWorkspace`** replaces `ReviewerWorkspace`, `StepUnderstanding`, `StepOutcome`, and `LegacyReviewItem`. Single-pane form with vulnerability category dropdown, exploit status radio, severity dropdown, reproduction steps textarea, recommended fix textarea.
2. **Update `MediaPanel`** add render blocks for `traceData.toolCalls`, `traceData.attackType`, `traceData.targetEndpoint`
3. **Update `/operator/item/page.tsx`** wire the new component, map form state to new API payload shape
4. **Update `/operator/home` and `/operator/history`** new decision labels, new severity badges
5. **New page: `/admin/findings`** Lead auditor review page
6. **Update `/buyer/home`** Resilience score gauge, executive summary view
7. **Update `/buyer/cases` and `/buyer/cases/[id]`** new vulnerability labels and badges

## Coordination

Step 1 enum changes are pushed. Favor can start building frontend against the new enum values immediately. George runs the migration and builds the auditor endpoints in parallel.

---

## Resolved Questions

1. **Old data-QA workflow?** Hidden, code kept. `/qa/queue` stays in codebase but not linked in nav.
2. **Contributor portal?** Hidden, code kept. `/capture` stays in codebase but not linked.
3. **Calibration scenarios?** Updated to new taxonomy (VLN tags, exploit status, P0-P3 severity).
4. **Old /solutions pages?** Removed from codebase.
