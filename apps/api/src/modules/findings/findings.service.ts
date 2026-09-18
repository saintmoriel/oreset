import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import type { AuditorDecision, FindingStatus, OperatorDecision, RoleType, Severity, VulnTag } from '@oreset/shared'
import { db } from '../../db/client'
import { clientQueueItems, operatorReviewDecisions, verifiedFindings, clientTickets, users } from '../../db/schema'
import { writeAuditLog } from '../../lib/audit'
import { fireWebhooksForItem } from '../../lib/webhooks'
import { sendMail } from '../../lib/mail'
import { env } from '../../config/env'
import { HttpError } from '../../middleware/error-handler'
import { ingestSingle } from '../ingestion/ingestion.service'

async function contactFor(userId: string | null | undefined) {
  if (!userId) return null
  const u = await db.query.users.findFirst({ where: eq(users.id, userId), columns: { email: true, displayName: true } })
  return u?.email ? { email: u.email, firstName: u.displayName?.split(' ')[0] ?? 'there' } : null
}

// ---------------------------------------------------------------------------
// Resilience scoring (see DASHBOARD-SPEC.md, Step 4)
// ---------------------------------------------------------------------------

const SEVERITY_PENALTY: Record<Severity, number> = { P0: 25, P1: 15, P2: 8, P3: 3 }
const SEVERITY_ORDER: Record<Severity, number> = { P0: 0, P1: 1, P2: 2, P3: 3 }

export function resilienceLabel(score: number): string {
  if (score >= 90) return 'Production ready'
  if (score >= 70) return 'Needs remediation'
  if (score >= 50) return 'Significant risk'
  return 'Do not deploy'
}

// operator_review_decisions.client_item_id stores the item's externalRef
// (text), not its uuid. Resolve the newest matching queue item.
async function findItemForDecision(externalRef: string) {
  return db.query.clientQueueItems.findFirst({
    where: eq(clientQueueItems.externalRef, externalRef),
    orderBy: desc(clientQueueItems.createdAt),
  })
}

// ---------------------------------------------------------------------------
// Lead auditor: verification queue
// ---------------------------------------------------------------------------

// Findings that need a second pair of eyes before they reach the client:
// every confirmed P0/P1 exploit, and every escalation.
export async function getVerificationQueue() {
  const alreadyVerified = db.select({ id: verifiedFindings.reviewDecisionId }).from(verifiedFindings)

  const decisions = await db.query.operatorReviewDecisions.findMany({
    where: and(
      sql`${operatorReviewDecisions.id} NOT IN (${alreadyVerified})`,
      sql`(${operatorReviewDecisions.decision} = 'escalated' OR (${operatorReviewDecisions.decision} = 'exploited' AND ${operatorReviewDecisions.severity} IN ('P0', 'P1')))`,
    ),
    orderBy: desc(operatorReviewDecisions.createdAt),
    limit: 200,
  })

  if (decisions.length === 0) return []

  const operatorIds = [...new Set(decisions.map((d) => d.operatorId))]
  const operators = await db.query.users.findMany({
    where: inArray(users.id, operatorIds),
    columns: { id: true, displayName: true, operatorCode: true },
  })
  const operatorById = new Map(operators.map((o) => [o.id, o]))

  const refs = [...new Set(decisions.map((d) => d.clientItemId))]
  const items = await db.query.clientQueueItems.findMany({
    where: inArray(clientQueueItems.externalRef, refs),
    columns: { id: true, externalRef: true, status: true, submittedBy: true, requiresDualSolve: true },
  })
  const itemByRef = new Map(items.map((i) => [i.externalRef, i]))

  const rank = (d: (typeof decisions)[number]) => {
    if (d.decision === 'exploited' && d.severity) return SEVERITY_ORDER[d.severity]
    return 10 // escalations after confirmed exploits
  }

  return decisions
    .map((d) => ({
      decision: d,
      operator: operatorById.get(d.operatorId) ?? null,
      item: itemByRef.get(d.clientItemId) ?? null,
    }))
    .sort((a, b) => {
      const r = rank(a.decision) - rank(b.decision)
      return r !== 0 ? r : a.decision.createdAt.getTime() - b.decision.createdAt.getTime()
    })
}

export async function getFindingDetail(decisionId: string) {
  const decision = await db.query.operatorReviewDecisions.findFirst({
    where: eq(operatorReviewDecisions.id, decisionId),
  })
  if (!decision) throw new HttpError(404, 'not_found', 'Finding not found.')

  const [item, verification, operator] = await Promise.all([
    findItemForDecision(decision.clientItemId),
    db.query.verifiedFindings.findFirst({ where: eq(verifiedFindings.reviewDecisionId, decisionId) }),
    db.query.users.findFirst({
      where: eq(users.id, decision.operatorId),
      columns: { id: true, displayName: true, operatorCode: true },
    }),
  ])

  return { decision, item: item ?? null, verification: verification ?? null, operator: operator ?? null }
}

// ---------------------------------------------------------------------------
// Lead auditor: verify / adjust / reject a finding
// ---------------------------------------------------------------------------

export async function verifyFinding(input: {
  decisionId: string
  auditorId: string
  auditorRole: RoleType
  verdict: AuditorDecision
  adjustedSeverity?: Severity
  reproducible: boolean
  blastRadius?: string
  auditorNotes?: string
}) {
  const decision = await db.query.operatorReviewDecisions.findFirst({
    where: eq(operatorReviewDecisions.id, input.decisionId),
  })
  if (!decision) throw new HttpError(404, 'not_found', 'Finding not found.')

  const existing = await db.query.verifiedFindings.findFirst({
    where: eq(verifiedFindings.reviewDecisionId, input.decisionId),
  })
  if (existing) throw new HttpError(409, 'already_verified', 'This finding has already been verified.')

  if (input.verdict === 'severity_adjusted' && !input.adjustedSeverity) {
    throw new HttpError(400, 'validation_error', 'adjustedSeverity is required when adjusting severity.')
  }

  const item = await findItemForDecision(decision.clientItemId)
  if (!item) throw new HttpError(404, 'not_found', 'The client scenario for this finding no longer exists.')

  const isFalsePositive = input.verdict === 'false_positive'

  const [finding] = await db
    .insert(verifiedFindings)
    .values({
      clientItemId: item.id,
      reviewDecisionId: decision.id,
      auditorId: input.auditorId,
      verdict: input.verdict,
      adjustedSeverity: input.verdict === 'severity_adjusted' ? input.adjustedSeverity : null,
      reproducible: input.reproducible,
      blastRadius: input.blastRadius,
      auditorNotes: input.auditorNotes,
      status: isFalsePositive ? 'false_positive' : 'verified',
    })
    .returning()

  // The auditor's verdict is what the client sees, so it overrides the
  // tester's provisional status on the scenario.
  await db
    .update(clientQueueItems)
    .set({ status: isFalsePositive ? 'defended' : 'exploited' })
    .where(eq(clientQueueItems.id, item.id))

  // An escalation ticket is answered by this verification.
  await db
    .update(clientTickets)
    .set({
      status: 'resolved',
      resolvedBy: input.auditorId,
      resolvedAt: new Date(),
      resolutionNotes: input.auditorNotes ?? `Lead auditor verdict: ${input.verdict}`,
    })
    .where(and(eq(clientTickets.operatorReviewDecisionId, decision.id), eq(clientTickets.status, 'open')))

  await writeAuditLog({
    actorId: input.auditorId,
    actorLabel: input.auditorId,
    actorRole: input.auditorRole,
    action: `finding.${input.verdict}`,
    resourceType: 'verified_finding',
    resourceId: finding.id,
    metadata: {
      decisionId: decision.id,
      vulnTag: decision.vulnTag,
      severity: input.adjustedSeverity ?? decision.severity,
      reproducible: input.reproducible,
    },
  })

  fireWebhooksForItem(item.id, 'finding.verified', {
    findingId: finding.id,
    verdict: input.verdict,
    vulnTag: decision.vulnTag,
    severity: input.adjustedSeverity ?? decision.severity,
    reproducible: input.reproducible,
    blastRadius: input.blastRadius ?? null,
  })

  // Close the loop with both people who care: the client (a finding is now
  // on their dashboard) and the tester (their call was confirmed or not).
  const severity = input.adjustedSeverity ?? decision.severity
  const [client, tester] = await Promise.all([contactFor(item.submittedBy), contactFor(decision.operatorId)])

  if (client && !isFalsePositive) {
    void sendMail({
      to: client.email,
      subject: `${severity ?? 'New'} finding verified on ${item.clientName}`,
      text: [
        `Hi ${client.firstName},`,
        '',
        `A lead auditor has verified a ${severity ?? ''} finding on ${item.clientName}${decision.vulnTag ? ` (${decision.vulnTag})` : ''}.`,
        input.blastRadius ? `\nBusiness impact: ${input.blastRadius}\n` : '',
        'Reproduction steps and a recommended fix are on your dashboard. When you have fixed it, mark it fixed there and we will retest at no extra cost.',
        '',
        `${env.WEB_PUBLIC_URL}/buyer/findings`,
        '',
        'Oreset',
      ].join('\n'),
    })
  }

  if (tester) {
    const outcome =
      input.verdict === 'verified' ? 'verified and sent to the client'
      : input.verdict === 'severity_adjusted' ? `verified, with severity changed to ${input.adjustedSeverity}`
      : 'ruled a false positive and will not reach the client'
    void sendMail({
      to: tester.email,
      subject: `Your finding on ${item.externalRef} was ${input.verdict === 'false_positive' ? 'not accepted' : 'verified'}`,
      text: [
        `Hi ${tester.firstName},`,
        '',
        `The lead auditor reviewed your finding on ${item.externalRef} (${item.clientName}). It was ${outcome}.`,
        input.auditorNotes ? `\nAuditor notes: ${input.auditorNotes}\n` : '',
        `Reproduced by the auditor: ${input.reproducible ? 'yes' : 'no'}.`,
        '',
        `${env.WEB_PUBLIC_URL}/operator/history`,
        '',
        'Oreset Red Team',
      ].join('\n'),
    })
  }

  return finding
}

export async function getVerificationStats() {
  const pending = await getVerificationQueue()

  const rows = await db
    .select({ verdict: verifiedFindings.verdict, status: verifiedFindings.status, count: sql<number>`count(*)::int` })
    .from(verifiedFindings)
    .groupBy(verifiedFindings.verdict, verifiedFindings.status)

  const byVerdict: Record<AuditorDecision, number> = { verified: 0, false_positive: 0, severity_adjusted: 0 }
  const byStatus: Partial<Record<FindingStatus, number>> = {}
  let total = 0
  for (const r of rows) {
    byVerdict[r.verdict] += r.count
    byStatus[r.status] = (byStatus[r.status] ?? 0) + r.count
    total += r.count
  }

  return {
    pendingVerification: pending.length,
    totalVerified: total,
    byVerdict,
    byStatus,
    falsePositiveRate: total > 0 ? Math.round((byVerdict.false_positive / total) * 100) : null,
  }
}

// ---------------------------------------------------------------------------
// Client: findings dashboard + resilience score
// ---------------------------------------------------------------------------

export type ClientFinding = {
  id: string | null // verified_findings.id, null while still pending verification
  decisionId: string
  itemId: string
  externalRef: string
  clientName: string
  domain: string | null
  attackType: string | null
  targetEndpoint: string | null
  vulnTag: VulnTag | null
  severity: Severity | null
  exploitStatus: string | null
  reproductionSteps: string | null
  recommendedFix: string | null
  testerNotes: string | null
  blastRadius: string | null
  reproducible: boolean | null
  verdict: AuditorDecision | 'pending'
  status: FindingStatus
  foundAt: string
  verifiedAt: string | null
  fixSubmittedAt: string | null
  retestedAt: string | null
  closedAt: string | null
}

export async function getBuyerFindings(buyerId: string) {
  const items = await db.query.clientQueueItems.findMany({
    where: eq(clientQueueItems.submittedBy, buyerId),
    columns: { id: true, externalRef: true, clientName: true, traceData: true, status: true },
  })

  const empty = {
    score: 100,
    label: resilienceLabel(100),
    breakdown: { byVulnTag: {} as Record<string, number>, bySeverity: {} as Record<string, number> },
    counts: { open: 0, closed: 0, pendingVerification: 0, falsePositive: 0, fixSubmitted: 0 },
    findings: [] as ClientFinding[],
  }
  if (items.length === 0) return empty

  const itemIds = items.map((i) => i.id)
  const refs = [...new Set(items.map((i) => i.externalRef))]
  const itemByRef = new Map(items.map((i) => [i.externalRef, i]))

  const [verifications, decisions] = await Promise.all([
    db.query.verifiedFindings.findMany({ where: inArray(verifiedFindings.clientItemId, itemIds) }),
    db.query.operatorReviewDecisions.findMany({
      where: inArray(operatorReviewDecisions.clientItemId, refs),
      orderBy: desc(operatorReviewDecisions.createdAt),
    }),
  ])

  const decisionById = new Map(decisions.map((d) => [d.id, d]))
  const verifiedDecisionIds = new Set(verifications.map((v) => v.reviewDecisionId))

  const toFinding = (
    d: (typeof decisions)[number],
    v: (typeof verifications)[number] | null,
  ): ClientFinding | null => {
    const item = itemByRef.get(d.clientItemId)
    if (!item) return null
    const trace = (item.traceData ?? {}) as Record<string, unknown>
    return {
      id: v?.id ?? null,
      decisionId: d.id,
      itemId: item.id,
      externalRef: item.externalRef,
      clientName: item.clientName,
      domain: (trace.domain as string) ?? null,
      attackType: (trace.attackType as string) ?? null,
      targetEndpoint: (trace.targetEndpoint as string) ?? null,
      vulnTag: d.vulnTag,
      severity: v?.adjustedSeverity ?? d.severity,
      exploitStatus: d.exploitStatus,
      reproductionSteps: d.reproductionSteps,
      recommendedFix: d.recommendedFix,
      testerNotes: d.notes,
      blastRadius: v?.blastRadius ?? null,
      reproducible: v?.reproducible ?? null,
      verdict: v?.verdict ?? 'pending',
      status: v?.status ?? 'discovered',
      foundAt: d.createdAt.toISOString(),
      verifiedAt: v?.verifiedAt.toISOString() ?? null,
      fixSubmittedAt: v?.fixSubmittedAt?.toISOString() ?? null,
      retestedAt: v?.retestedAt?.toISOString() ?? null,
      closedAt: v?.closedAt?.toISOString() ?? null,
    }
  }

  const verified = verifications
    .map((v) => {
      const d = decisionById.get(v.reviewDecisionId)
      return d ? toFinding(d, v) : null
    })
    .filter((f): f is ClientFinding => f !== null)

  // Confirmed exploits the auditor has not ruled on yet. Shown to the client
  // as pending; they do not move the score until verified.
  const pending = decisions
    .filter((d) => d.decision === 'exploited' && !verifiedDecisionIds.has(d.id))
    .map((d) => toFinding(d, null))
    .filter((f): f is ClientFinding => f !== null)

  const findings = [...verified, ...pending].sort((a, b) => {
    const sa = a.severity ? SEVERITY_ORDER[a.severity] : 9
    const sb = b.severity ? SEVERITY_ORDER[b.severity] : 9
    return sa !== sb ? sa - sb : b.foundAt.localeCompare(a.foundAt)
  })

  // Score counts only auditor-verified, still-open findings. Closing a
  // finding through retest raises the score, which is the whole point.
  const active = verified.filter((f) => f.verdict !== 'false_positive' && f.status !== 'closed')
  const penalty = active.reduce((sum, f) => sum + (f.severity ? SEVERITY_PENALTY[f.severity] : 0), 0)
  const score = Math.max(0, 100 - penalty)

  const byVulnTag: Record<string, number> = {}
  const bySeverity: Record<string, number> = {}
  for (const f of active) {
    if (f.vulnTag) byVulnTag[f.vulnTag] = (byVulnTag[f.vulnTag] ?? 0) + 1
    if (f.severity) bySeverity[f.severity] = (bySeverity[f.severity] ?? 0) + 1
  }

  return {
    score,
    label: resilienceLabel(score),
    breakdown: { byVulnTag, bySeverity },
    counts: {
      open: active.length,
      closed: verified.filter((f) => f.status === 'closed').length,
      pendingVerification: pending.length,
      falsePositive: verified.filter((f) => f.verdict === 'false_positive').length,
      fixSubmitted: verified.filter((f) => f.status === 'fix_submitted' || f.status === 'retesting').length,
    },
    findings,
  }
}

// ---------------------------------------------------------------------------
// Client: "we fixed it" → queue a free retest
// ---------------------------------------------------------------------------

export async function markFindingFixed(buyerId: string, findingId: string) {
  const finding = await db.query.verifiedFindings.findFirst({ where: eq(verifiedFindings.id, findingId) })
  if (!finding) throw new HttpError(404, 'not_found', 'Finding not found.')

  const item = await db.query.clientQueueItems.findFirst({ where: eq(clientQueueItems.id, finding.clientItemId) })
  // 404, not 403: a client probing another client's finding id learns nothing.
  if (!item || item.submittedBy !== buyerId) throw new HttpError(404, 'not_found', 'Finding not found.')

  if (finding.verdict === 'false_positive') {
    throw new HttpError(409, 'invalid_state', 'False positives do not need a fix.')
  }
  if (finding.status === 'closed') {
    throw new HttpError(409, 'invalid_state', 'This finding is already closed.')
  }
  if (finding.status === 'fix_submitted' || finding.status === 'retesting') {
    throw new HttpError(409, 'retest_in_progress', 'A retest is already queued for this finding.')
  }

  const [{ count: priorRetests }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clientQueueItems)
    .where(sql`${clientQueueItems.traceData}->>'retestOf' = ${finding.id}`)

  const trace = (item.traceData ?? {}) as Record<string, unknown>
  const retestItem = await ingestSingle({
    clientName: item.clientName,
    externalRef: `${item.externalRef}-retest-${priorRetests + 1}`,
    content: item.content,
    traceData: { ...trace, retestOf: finding.id, isDualSolve: false },
    requiresDualSolve: false,
    submittedBy: buyerId,
  })

  const [updated] = await db
    .update(verifiedFindings)
    .set({ status: 'fix_submitted', fixSubmittedAt: new Date() })
    .where(eq(verifiedFindings.id, finding.id))
    .returning()

  await writeAuditLog({
    actorId: buyerId,
    actorLabel: buyerId,
    actorRole: 'buyer',
    action: 'finding.fix_submitted',
    resourceType: 'verified_finding',
    resourceId: finding.id,
    metadata: { retestItemId: retestItem.id },
  })

  return { finding: updated, retestItem }
}

// Called from operator.service.decide when the scenario being assessed is a
// retest. Defended closes the finding; exploited reopens it. Anything else
// leaves it waiting for a cleaner retest.
export async function applyRetestOutcome(input: {
  findingId: string
  decision: OperatorDecision
  operatorId: string
  notes?: string
}) {
  const finding = await db.query.verifiedFindings.findFirst({ where: eq(verifiedFindings.id, input.findingId) })
  if (!finding) return null

  const now = new Date()
  let status: FindingStatus | null = null
  if (input.decision === 'defended') status = 'closed'
  else if (input.decision === 'exploited') status = 'reopened'

  const [updated] = await db
    .update(verifiedFindings)
    .set({
      ...(status ? { status } : {}),
      retestedAt: now,
      retestedBy: input.operatorId,
      retestNotes: input.notes ?? null,
      ...(status === 'closed' ? { closedAt: now } : {}),
    })
    .where(eq(verifiedFindings.id, finding.id))
    .returning()

  if (status) {
    fireWebhooksForItem(finding.clientItemId, status === 'closed' ? 'finding.closed' : 'finding.reopened', {
      findingId: finding.id,
      status,
      retestNotes: input.notes ?? null,
    })

    const item = await db.query.clientQueueItems.findFirst({
      where: eq(clientQueueItems.id, finding.clientItemId),
      columns: { clientName: true, externalRef: true, submittedBy: true },
    })
    const client = await contactFor(item?.submittedBy)
    if (client && item) {
      void sendMail({
        to: client.email,
        subject: status === 'closed'
          ? `Retest passed: finding on ${item.externalRef} is closed`
          : `Retest failed: finding on ${item.externalRef} is open again`,
        text: [
          `Hi ${client.firstName},`,
          '',
          status === 'closed'
            ? `We re-ran the attack on ${item.clientName} after your fix. It no longer lands. The finding is closed and your resilience score has moved up.`
            : `We re-ran the attack on ${item.clientName} after your fix. It still lands. The finding has been reopened with the tester's notes.`,
          input.notes ? `\nTester notes: ${input.notes}\n` : '',
          `${env.WEB_PUBLIC_URL}/buyer/findings`,
          '',
          'Oreset',
        ].join('\n'),
      })
    }
  }

  return updated
}
