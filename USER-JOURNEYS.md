# Oreset User Journeys: from landing page to dashboard

**Purpose.** Walk every kind of visitor from the moment they land on oreset.africa to the moment they are productive in a dashboard, as the code actually behaves today (main, 18 September 2026). Every step that drops, confuses, or misleads a person is marked as a flaw. The fix list at the end is ordered by damage.

**How to read a journey.** Each step shows what the person does, what the system does, and a verdict:
OK means it works and reads right. FLAW means it breaks, lies, or leads nowhere. ROUGH means it works but a real user would stumble.

**Legend for flaw severity.** F0 loses money or trust today. F1 blocks a real workflow. F2 is confusing or off-positioning. F3 is polish.

---

## The people

| # | Persona | Who they are | What they want |
|---|---------|--------------|----------------|
| 1 | **Tunde**, CTO, Lagos payments startup | Shipping a support agent that can move money. Read about Air Canada. Scared. | Find out if Oreset is real, what it costs, and talk to a human. |
| 2 | **Amara**, security engineer at Tunde's company | The person who will actually use the dashboard every day once there is an engagement. | See findings, reproduce them, fix, prove the fix. |
| 3 | **Musa**, application security tester, Kano | Saw the hiring line on the site. Wants paid red-team work. | Apply, get in, start earning. |
| 4 | **Adaeze**, active red team tester | Already certified. Works the queue several evenings a week. | Clear scenarios fast, write good findings, get paid, know she is doing well. |
| 5 | **Favour**, lead auditor | Reproduces testers' findings before clients see them. | A clean queue, the evidence, one click to a verdict. |
| 6 | **The founder**, admin | Runs the company. Sells, staffs, oversees. | Know who has access, who the clients are, what is owed, what needs a decision. |
| 7 | **George**, backend developer | Builds and maintains it. | Run it locally, see every role, break nothing. |
| 8 | **Compliance officer** (future hire or external auditor) | Needs to prove what happened and who did it. | The audit trail. |
| 9 | **The stranger**: investor, journalist, curious engineer | Not buying, not applying. | Understand what Oreset is in two minutes. |

---

## 1. Tunde, prospective client

| Step | He does | System does | Verdict |
|------|---------|-------------|---------|
| 1 | Lands on `/` from LinkedIn | Hero: "Your AI agent will be attacked. It will also just decide wrong." Badge: human red team. | OK |
| 2 | Scrolls: Problem, What we test, the finding showcase | Sees a P0 finding card that looks like his own agent's failure mode | OK, strongest moment on the page |
| 3 | Clicks **Pricing** in the nav | `/pricing`: three tiers from $3,500, retest included everywhere | OK |
| 4 | Clicks **Cases** | Four public incidents with "what testing would have caught" | OK |
| 5 | Clicks **Trust** | Plain statements, admits no SOC 2 yet | OK, unusual honesty, buyers notice |
| 6 | Clicks **Request early access** | Modal opens: name, work email, organisation, agent type, languages, description | OK so far |
| 7 | Submits the form | **Waits 700 ms, shows "success". Nothing is sent, stored, or emailed. The request is gone.** (`pilot-scoping-modal.tsx`, `onSubmit`) | **F0** |
| 8 | Scrolls to the bottom **Get in touch** form and tries again | **Same fake submit.** (`contact.tsx`) | **F0** |
| 9 | Sees the footer email `info@oreset.africa` and writes | Depends entirely on someone reading that inbox. No record in the system. | ROUGH |
| 10 | Founder replies, scopes, agrees a pilot | Founder provisions his login on `/admin/clients` and sends a temporary password | OK (new) |
| 11 | Tunde receives the password by WhatsApp or email | No system email. Nothing tells him where to sign in except the founder's message. | ROUGH |
| 12 | Goes to `/buyer` | Sign-in page says **"Verification · Client Portal", "Access your verification cases, evidence traces"**. Language-era copy. Below: "Not a client yet? Start a pilot" links to the dead contact form. | **F2** |
| 13 | Signs in for the first time | Home shows **score 100, "Production ready"**, zero findings, zero scenarios. Before a single test has run, the dashboard tells him his agent is fine. | **F1** |
| 14 | Forgets his temporary password | **No "forgot password" anywhere on any sign-in page.** He has to message the founder, who resets it in People. | **F1** |
| 15 | Wants his engineer Amara to have access | **One login per client organisation.** He has to share his password. | **F1** |
| 16 | Engagement starts, testers run scenarios | Nothing tells him. No email, no in-app signal. He finds out by logging in. | **F1** |

**What sits right:** the public site does its job up to the click. Pricing, Cases, and Trust answer the three questions a buyer asks.

**What doesn't:** the two forms that convert a visitor into a conversation are fake. Every lead this site has generated so far has evaporated on click. This is the single most expensive flaw in the system.

---

## 2. Amara, the client's engineer (daily user)

| Step | She does | System does | Verdict |
|------|---------|-------------|---------|
| 1 | Gets Tunde's shared password, signs in at `/buyer` | Lands on Home: score, breakdowns, "Fix these first" | OK |
| 2 | Opens **Findings** | Every finding with lifecycle, severity, reproduction steps, recommended fix, blast radius | OK, this is the product |
| 3 | Reproduces a P0 locally using the steps | Works if the tester wrote good steps. Nothing enforces quality beyond the auditor. | OK |
| 4 | Ships a fix, clicks **Mark as fixed, request retest** | Finding moves to "Retest queued", a retest scenario enters the tester queue | OK |
| 5 | Waits to hear the retest result | **Nothing notifies her.** She refreshes the page over the following days. | **F1** |
| 6 | Wants the CI regression suite | `/buyer/regressions` explains it and offers JSON/JSONL download. Requires her session cookie, so her CI cannot pull it. **No API token for machines.** | **F1** |
| 7 | Wants to wire Slack or Jira via the webhooks the pricing page promises | **No webhooks page exists.** The API supports create, rotate, delete; the only way to use it is curl with her browser cookie. | **F1** |
| 8 | Wants to discuss a finding with the tester or auditor ("we think this is by design") | **No comments, no dispute, no way to reply.** Only the mark-as-fixed button. | **F1** |
| 9 | Wants to assign a finding to a colleague | Nothing. One account, no assignment. | F2 |
| 10 | Opens **Scenarios** | Sees every attack the red team ran, with verdicts | OK |
| 11 | Opens **Datasets** in the nav | Empty page about "datasets delivered to your organisation", a leftover from the data business. | F2 |

**What sits right:** the findings dashboard and lifecycle are complete and better than what most PTaaS clients get.

**What doesn't:** the client is alone in it. No notifications, no conversation, no machine access, no team. It is a very good read-only report that happens to be live.

---

## 3. Musa, prospective tester

| Step | He does | System does | Verdict |
|------|---------|-------------|---------|
| 1 | Sees the announcement bar: "Hiring AI security testers and red-team analysts. Apply" | Links to `/operators/join` | OK |
| 2 | Opens the application | Form asks: name, email, phone, password, location, **languages with fluency levels, dialect, academic background, English proficiency, availability, experience**. | **F2**. This is the language-annotator application. Nothing asks about security testing, LLM experience, tooling, or a work sample. |
| 3 | Submits | Account created with status `pending`, operator code shown on screen | OK |
| 4 | Expects a confirmation email | **None. No email is ever sent by the system.** | F2 |
| 5 | Signs in at `/operator` | Page says **"Certified Reviewer sign-in", "Signing in will take you to Foundry to finish training"** | **F2** stale copy |
| 6 | Redirected to `/operator/foundry` because he is pending | **A quiz about read-speech audio quality: pacing, clarity, "natural speech", flagging rushed recordings.** He is a security tester. | **F0** |
| 7 | Answers the audio quiz correctly | `POST /operators/certify` flips him to `active`. **He has certified himself. No human looked at his application.** | **F0** |
| 8 | Now active, lands on `/operator/home` | Onboarding checklist: profile, identity verification, agreements. **All optional.** He can open the queue without signing the NDA. | **F1** |
| 9 | Opens the queue and starts assessing a real client's scenario | **Calibration is in the nav but not required.** He has never been scored against a gold case. | **F1** |

**What sits right:** the mechanics exist. Application, pending state, activation, agreements, identity documents, calibration with gold cases, all built.

**What doesn't:** they are in the wrong order and the gate is the wrong test. The system currently lets an anonymous person become a red team tester with access to client attack data by passing an audio-quality quiz and skipping the NDA.

---

## 4. Adaeze, active tester

| Step | She does | System does | Verdict |
|------|---------|-------------|---------|
| 1 | Signs in, sees Home: today, all-time, exploit rate, queue count, recent findings, categories | OK |
| 2 | Opens the queue | Scenarios with attack type, domain, language, retest badges | OK |
| 3 | Clicks **Start assessing** | Workspace: exploit trace left, form right, timer running | OK |
| 4 | Wants to read the client's scope brief before deciding | It is in a collapsed "Scope brief" section at the bottom of the left pane | ROUGH, should be visible first for a new client |
| 5 | Submits a finding | Next scenario loads. **No confirmation, no undo, no "you just submitted X".** | F2 |
| 6 | Escalates a scenario to the lead auditor | Ticket created. **She never learns the outcome unless she checks History and sees "Auditor resolved".** | **F1** feedback loop missing |
| 7 | Her P0 gets rejected as a false positive by the auditor | **She is not told, and it does not appear on her stats.** She keeps making the same mistake. | **F1** |
| 8 | Opens **Calibration** | Gold cases with instant feedback | OK, good |
| 9 | Opens **Settings, Payouts** | Payout details form. **Nothing shows what she has earned or what a finding pays.** The payout model still belongs to the data-collection era (per submission). | **F1** |
| 10 | Wants to skip a scenario she cannot judge | Only "inconclusive" or "escalate". No "skip, give it to someone else". | F2 |
| 11 | Opens **Support** in the sidebar | Links to a page written for contributors | F2 |

**What sits right:** the workspace itself. It is focused and complete.

**What doesn't:** she works in silence. No feedback from auditors, no pay visibility, no confirmation. Testers who do not know how they are doing either leave or get sloppy.

---

## 5. Favour, lead auditor

| Step | She does | System does | Verdict |
|------|---------|-------------|---------|
| 1 | Signs in at `/admin` | Page says **"Admin · RBAC", "Role is assigned server-side and enforced on every request"**. Developer language on a login page. | F2 |
| 2 | Lands on Home | Three tiles: findings awaiting verification, open escalations, split assessments | OK (new) |
| 3 | Opens **Findings** | Queue ordered P0 first, then P1, then escalations | OK |
| 4 | Sees the old **FirstBank** test ticket from August above the real client | Legacy dev data in a shared database | F3, delete it |
| 5 | Expands a finding | Exploit trace, tester's write-up, reproduce toggle, verdict, blast radius, notes | OK |
| 6 | Records a verdict | Finding disappears from queue, ticket resolved, scenario status set | OK |
| 7 | Realises she picked the wrong verdict | **No undo, no edit.** The verdict is final the instant it is saved. | **F1** |
| 8 | A second auditor joins | **No assignment or claiming.** Two auditors can open the same finding and both record verdicts; the second gets a 409 error. | F2 |
| 9 | Wants to see how old the oldest waiting finding is | No age or SLA indicator on the queue | F2 |
| 10 | Wants to filter the queue by client during a readout | No filter | F2 |
| 11 | Wants to tell the tester why it was a false positive | Writes auditor notes. **The tester never sees them.** | **F1** same gap as Adaeze step 7 |

**What sits right:** the verification flow is the strongest new piece. The evidence is all on one screen.

**What doesn't:** it is built for one auditor working alone with no mistakes. Two auditors, one wrong click, or one curious tester and it strains.

---

## 6. The founder, admin

| Step | You do | System does | Verdict |
|------|--------|-------------|---------|
| 1 | Sign in at `/admin`, land on Home | Needs-a-decision number, business strip, engagement health, findings totals | OK (new) |
| 2 | Open **People** | Every account, role, reach, last sign-in, controls | OK (new) |
| 3 | Open **Clients** | Each client with score, findings, payments, provisioning | OK (new) |
| 4 | Want to see the leads that came in from the website | **There are none. The forms never stored anything.** | **F0** (same root cause as Tunde 7) |
| 5 | Want to record that SafariPay's engagement is "Comprehensive Red Team, started 15 Sept, readout due 29 Sept, $6,500" | **No engagement object exists.** Scenarios hang off the client with no scope, dates, tier, or price attached. | **F1** |
| 6 | Want to invoice a client | **No screen creates an invoice.** The billing API exists; only "collected, last 30 days" is shown. | **F1** |
| 7 | Want to approve Musa's application before he sees client data | **No approve step.** He self-certifies (persona 3). The Applications page is read-only. | **F0** |
| 8 | Want to pay Adaeze for last month | Payouts page and API are built around data-collection submissions, not findings or hours | **F1** |
| 9 | Want to send a client their executive summary | Nothing. Screenshot the dashboard. | F2 |
| 10 | Want to know when something needs you without logging in | No email or Slack to you either | F2 |
| 11 | Open **Audit Log** | Everything anyone did, including the new People actions | OK |

---

## 7. George, developer

| Step | Verdict |
|------|---------|
| Clone, `pnpm install`, migrate, seed, smoke, dev | OK, documented in `DASHBOARD-SPEC.md` |
| Sign in as each seeded role | OK |
| Reset the demo | OK, `--reset` |
| Legacy portals `/qa` and `/capture` still exist and are reachable by URL with the right role | F3, hidden not removed, fine for now |
| No staging environment; dev database is shared and accumulates real clicks | F2, documented rough edge |

---

## 8. Compliance officer

| Step | Verdict |
|------|---------|
| Sign in, see Home pointing at the audit log | OK |
| Audit log lists actions with actor, role, time | OK |
| Export the log for an external auditor | **No export.** Screen only. | F2 |
| Prove who could access client X's data during the engagement | Reconstructable from People plus the log, but not in one view | F2 |

---

## 9. The stranger

| Step | Verdict |
|------|---------|
| Lands, reads hero, scrolls | OK, the page explains itself |
| Wants to know who is behind it | **Company page has no names, no faces, no founder.** For an investor or journalist that is the first question. | F2 |
| Wants press or partnership contact | Only the sales form (fake) or the footer email | F2 |
| Wants to read something | Cases exists. Blog and Documentation say "coming soon" | F3 |

---

## Cross-cutting flaws (the ones behind many rows above)

**Status as of 18 September 2026.** X1, X3, X4 fixed. X2 partly fixed: the mail helper exists and sends lead acknowledgements, approval and rejection notices, and password reset links; finding-lifecycle and verdict notifications still to do. X9 partly fixed (sign-in copy, site metadata). Feedback toasts now cover sign-in, application, submissions, verdicts, account actions. Everything else below is still open.

| ID | Flaw | Hits | Severity |
|----|------|------|----------|
| X1 | ~~Both public forms fake their submit.~~ **Fixed:** leads table, admin Leads inbox, acknowledgement email, rate limit and honeypot. | Tunde, founder | ~~F0~~ done |
| X2 | **The system sends no email of any kind.** **Partly fixed:** `lib/mail.ts` (Resend or console). Wired: lead received, lead acknowledgement, tester approved, tester rejected, password reset link, password changed. **Still open:** finding verified (client), retest closed or reopened (client), verdict recorded on your finding (tester), "needs your decision" (admin). | Everyone | **F1** (was F0) |
| X3 | ~~Tester onboarding gate is the wrong test and has no human step.~~ **Fixed:** Foundry retired, admin or lead approves from Applications, agreements and two calibration passes required before the queue opens, pending status page. Application form questions still language-era (see X9). | Musa, founder, every client | ~~F0~~ done |
| X4 | ~~No forgot-password flow.~~ **Fixed:** all three sign-ins, 30 minute single-use token by email, all sessions ended on reset. | Everyone | ~~F1~~ done |
| X5 | **No engagement object.** No scope, tier, dates, price, or phase. Clients page and client home both want it. | Founder, Tunde, Amara | **F1** |
| X6 | **One login per client organisation.** No teammates, no roles inside a client. | Tunde, Amara | **F1** |
| X7 | **Feedback loops are missing between roles.** Auditor to tester (verdict and notes), tester to client (nothing), client to Oreset (no comments or disputes). | Adaeze, Favour, Amara | **F1** |
| X8 | **No machine access for clients.** Regression export and webhooks require a browser session. | Amara | **F1** |
| X9 | **Payouts, applications, Support, Datasets, Foundry, sign-in copy** still describe the language-data business. | Musa, Adaeze, Tunde | **F2** |
| X10 | **First-login empty state lies.** Score 100 "Production ready" with no data. | Tunde | **F1** |
| X11 | **Verdicts and assessments cannot be corrected.** | Favour, Adaeze | **F1** |
| X12 | **Legacy dev data** (FirstBank) in the shared database shows up in real queues. | Favour | F3 |

---

## Fix order

Ordered by how much damage each flaw does today, then by how small the fix is. Sizes: S under half a day, M one to two days, L three or more.

### Stop the bleeding (this week)

1. ~~Wire the two forms~~ **Done** (X1)
2. **Transactional email.** ~~Helper and provider~~ **Done.** Still to wire: account created with sign-in link, tester application received, finding verified (client), retest closed or reopened (client), verdict recorded (tester). (X2) **S** each
3. ~~Forgot password~~ **Done** (X4)
4. **Fix the tester gate.** ~~Approval step, agreements and calibration required, Foundry retired~~ **Done.** Still to do: rewrite the application form for security testers (experience, tooling, LLM red-team exposure, one short work sample). (X3) **S**
5. **First-login empty state.** No score until at least one verified finding or one completed scenario; show engagement phase and "testing begins on" instead. (X10) **S**
6. **Delete legacy dev data** and the `campaigns`/`batches` seed from the shared database. (X12) **S**

### Make it a system, not a set of screens (next two weeks)

7. **Engagement object.** Table: client, agent name, tier, scope summary, start, readout due, phase, price, status. Clients page, client home banner, admin home, and invoices all key off it. This is the decision George owns. (X5) **M**
8. **Client teammates.** Client organisation with multiple users, owner and member roles, invite by email. (X6) **M**
9. **Notifications in-app**, backed by the same events as email: a bell with "your finding was verified", "retest closed", "decision needed". (X7) **M**
10. **Comments on a finding**, visible to client, tester who wrote it, and auditors. Threaded, audit-logged. This is also how disputes happen. (X7) **M**
11. **Auditor notes flow back to the tester**, on their History page and by email. Tester stats gain "false positive rate". (X7) **S** once 9 exists
12. **Correctable verdicts**: an auditor can amend within 24 hours, with the change logged; a tester can withdraw a submission before the auditor opens it. (X11) **M**
13. **Client API tokens** for regression export and webhooks, and a **Webhooks page** in the client portal. (X8) **M**
14. **Invoice creation** from the Clients page, tied to an engagement. (founder 6) **S**, the API exists

### Finish the pivot (when time allows)

15. Rewrite sign-in copy, tester Support page, remove Datasets from client nav, rebuild Payouts around findings or hours, delete `/qa` and `/capture` code. (X9) **M**
16. Auditor queue: claim a finding, age indicator, client filter. **S each**
17. Audit log export as CSV, and a per-client access report. **S**
18. Company page with names and faces; press contact. **S**, needs your content
19. Executive summary export. **M**

---

## What the dashboards need to be, for everyone

The current portals were built role by role. That is why each one is strong inside and weak at the edges: the edges are where roles meet. The fixes above that matter most are all edges: lead to founder, applicant to approver, auditor to tester, finding to client engineer, client to machine. Fix the edges and the same three portals become one system.

Two design rules to carry forward:

1. **Every state change that someone else cares about produces a notification and a place to reply.** Verified, closed, reopened, escalated, approved, rejected. If it changes and nobody is told, it did not happen as far as that person is concerned.
2. **Every screen shows the truth about its own emptiness.** No default scores, no "production ready" before a test, no "success" when nothing was sent.

Everything else on the list is a consequence of those two.
