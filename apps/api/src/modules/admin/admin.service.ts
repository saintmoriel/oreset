import { and, avg, count, desc, eq, gte, isNull, sql, type SQL } from 'drizzle-orm'
import type { PgTable } from 'drizzle-orm/pg-core'
import type { StaffRole } from '@oreset/shared'
import { VULN_TAGS, type VulnTag } from '@oreset/shared'
import { db } from '../../db/client'
import {
  users,
  operatorReviewDecisions,
  calibrationAttempts,
  consensusPairs,
  operatorApplications,
  clientQueueItems,
  verifiedFindings,
  clientTickets,
} from '../../db/schema'
import { getQueueCount as getOperatorQueueCount } from '../operator/operator.service'
import { getVerificationQueue, getVerificationStats } from '../findings/findings.service'
import { getBusinessNumbers } from './people.service'
import { countNewLeads } from '../leads/leads.service'
import { listAuditLog } from '../audit/audit.service'

// ---------------------------------------------------------------------------
// Overview: the engagement operations console. Everything here is a number
// someone has to act on today or a number that tells you whether the red
// team is working. Old data-collection stats (campaigns, datasets, QA
// backlog) are gone; those portals are hidden.
// ---------------------------------------------------------------------------

async function countWhere(table: PgTable, where: SQL) {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(table).where(where)
  return row?.n ?? 0
}

async function countPendingTesterApplications() {
  return countWhere(users, sql`${users.role} = 'operator' AND ${users.status} = 'pending'`)
}

async function countOpenEscalations() {
  return countWhere(clientTickets, sql`${clientTickets.status} = 'open'`)
}

async function countConsensusSplits() {
  return countWhere(consensusPairs, sql`${consensusPairs.status} = 'disagreed'`)
}

async function countRetestsQueued() {
  return countWhere(
    clientQueueItems,
    sql`${clientQueueItems.status} IN ('pending', 'in_review') AND ${clientQueueItems.traceData}->>'retestOf' IS NOT NULL`,
  )
}

async function countActiveClients() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const [row] = await db
    .select({ n: sql<number>`count(distinct ${clientQueueItems.clientName})::int` })
    .from(clientQueueItems)
    .where(gte(clientQueueItems.createdAt, thirtyDaysAgo))
  return row?.n ?? 0
}

async function getFindingLifecycleCounts() {
  const rows = await db
    .select({ status: verifiedFindings.status, n: sql<number>`count(*)::int` })
    .from(verifiedFindings)
    .groupBy(verifiedFindings.status)
  const by = Object.fromEntries(rows.map((r) => [r.status, r.n])) as Partial<Record<string, number>>
  return {
    open: (by.verified ?? 0) + (by.reopened ?? 0),
    inRetest: (by.fix_submitted ?? 0) + (by.retesting ?? 0),
    closed: by.closed ?? 0,
  }
}

async function getWeekActivity() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const rows = await db
    .select({ decision: operatorReviewDecisions.decision, n: sql<number>`count(*)::int` })
    .from(operatorReviewDecisions)
    .where(gte(operatorReviewDecisions.createdAt, sevenDaysAgo))
    .groupBy(operatorReviewDecisions.decision)
  const by = Object.fromEntries(rows.map((r) => [r.decision, r.n])) as Partial<Record<string, number>>
  const total = rows.reduce((s, r) => s + r.n, 0)
  const exploited = by.exploited ?? 0
  return {
    scenariosAssessed7d: total,
    exploited7d: exploited,
    exploitRate7d: total > 0 ? Math.round((exploited / total) * 100) : null,
  }
}

async function getAdminOverview() {
  const [
    verificationQueue,
    verificationStats,
    openEscalations,
    consensusSplits,
    pendingTesterApplications,
    scenariosQueued,
    retestsQueued,
    activeClients,
    findings,
    week,
    business,
    newLeads,
    recentAuditEntries,
  ] = await Promise.all([
    getVerificationQueue(),
    getVerificationStats(),
    countOpenEscalations(),
    countConsensusSplits(),
    countPendingTesterApplications(),
    getOperatorQueueCount(),
    countRetestsQueued(),
    countActiveClients(),
    getFindingLifecycleCounts(),
    getWeekActivity(),
    getBusinessNumbers(),
    countNewLeads(),
    listAuditLog({ limit: 8 }),
  ])

  const findingsAwaitingVerification = verificationQueue.length

  return {
    role: 'admin' as const,
    needsAttention: findingsAwaitingVerification + openEscalations + consensusSplits + pendingTesterApplications + newLeads,
    newLeads,
    findingsAwaitingVerification,
    openEscalations,
    consensusSplits,
    pendingTesterApplications,
    activeClients,
    scenariosQueued,
    retestsQueued,
    findingsOpen: findings.open,
    findingsInRetest: findings.inRetest,
    findingsClosed: findings.closed,
    scenariosAssessed7d: week.scenariosAssessed7d,
    exploited7d: week.exploited7d,
    exploitRate7d: week.exploitRate7d,
    totalVerified: verificationStats.totalVerified,
    falsePositiveRate: verificationStats.falsePositiveRate,
    business,
    recentAuditEntries,
  }
}

async function getReviewerLeadOverview() {
  const [verificationQueue, openEscalations, consensusSplits] = await Promise.all([
    getVerificationQueue(),
    countOpenEscalations(),
    countConsensusSplits(),
  ])
  return {
    role: 'reviewer_lead' as const,
    findingsAwaitingVerification: verificationQueue.length,
    openEscalations,
    consensusSplits,
  }
}

async function getComplianceOverview() {
  const recentAuditEntries = await listAuditLog({ limit: 8 })
  return { role: 'compliance' as const, recentAuditEntries }
}

export async function getOverview(staffRole: StaffRole) {
  if (staffRole === 'admin') return getAdminOverview()
  if (staffRole === 'reviewer_lead') return getReviewerLeadOverview()
  return getComplianceOverview()
}

// ---------------------------------------------------------------------------
// Operator Performance
// ---------------------------------------------------------------------------

export async function getOperatorPerformance() {
  const operators = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      operatorCode: users.operatorCode,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, 'operator'))

  const operatorIds = operators.map((o) => o.id)
  if (operatorIds.length === 0) return { operators: [] }

  const allDecisions = await db.query.operatorReviewDecisions.findMany({
    columns: {
      id: true,
      operatorId: true,
      decision: true,
      vulnTag: true,
      severity: true,
      reviewTimeMs: true,
      createdAt: true,
    },
  })

  const allCalibration = await db.query.calibrationAttempts.findMany({
    columns: {
      operatorId: true,
      result: true,
      score: true,
      createdAt: true,
    },
  })

  const allConsensusPairs = await db.query.consensusPairs.findMany({
    columns: {
      reviewerOneId: true,
      reviewerTwoId: true,
      status: true,
    },
    where: sql`${consensusPairs.status} != 'awaiting_reviews'`,
  })

  const applications = await db.query.operatorApplications.findMany({
    columns: {
      userId: true,
      languages: true,
      location: true,
    },
  })

  const appMap = new Map(applications.map((a) => [a.userId, a]))

  const today = new Date().toISOString().slice(0, 10)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const result = operators.map((op) => {
    const decisions = allDecisions.filter((d) => d.operatorId === op.id)
    const calibrations = allCalibration.filter((c) => c.operatorId === op.id)

    const consensusAsReviewer = allConsensusPairs.filter(
      (p) => p.reviewerOneId === op.id || p.reviewerTwoId === op.id,
    )
    const consensusAgreed = consensusAsReviewer.filter((p) => p.status === 'agreed').length

    const totalReviews = decisions.length
    const reviewsToday = decisions.filter((d) => d.createdAt.toISOString().slice(0, 10) === today).length
    const reviews7d = decisions.filter((d) => d.createdAt >= sevenDaysAgo).length
    const reviews30d = decisions.filter((d) => d.createdAt >= thirtyDaysAgo).length

    const exploited = decisions.filter((d) => d.decision === 'exploited').length
    const defended = decisions.filter((d) => d.decision === 'defended').length
    const escalated = decisions.filter((d) => d.decision === 'escalated').length
    const inconclusive = decisions.filter((d) => d.decision === 'inconclusive').length
    const exploitRate = totalReviews > 0 ? Math.round((exploited / totalReviews) * 100) : null

    const vulnTagBreakdown = Object.fromEntries(VULN_TAGS.map((tag) => [tag, 0])) as Record<VulnTag, number>
    for (const d of decisions) {
      if (d.vulnTag) vulnTagBreakdown[d.vulnTag] += 1
    }

    const reviewTimes = decisions.filter((d) => d.reviewTimeMs != null).map((d) => d.reviewTimeMs!)
    const avgReviewTimeMs = reviewTimes.length > 0
      ? Math.round(reviewTimes.reduce((s, t) => s + t, 0) / reviewTimes.length)
      : null
    const medianReviewTimeMs = reviewTimes.length > 0
      ? reviewTimes.sort((a, b) => a - b)[Math.floor(reviewTimes.length / 2)]
      : null

    const calibrationAttempts = calibrations.length
    const calibrationPassed = calibrations.filter((c) => c.result === 'pass').length
    const calibrationPassRate = calibrationAttempts > 0
      ? Math.round((calibrationPassed / calibrationAttempts) * 100)
      : null
    const calibrationAvgScore = calibrationAttempts > 0
      ? Math.round(calibrations.reduce((s, c) => s + c.score, 0) / calibrationAttempts * 100)
      : null

    const consensusTotal = consensusAsReviewer.length
    const consensusAgreementRate = consensusTotal > 0
      ? Math.round((consensusAgreed / consensusTotal) * 100)
      : null

    const app = appMap.get(op.id)
    const languages = Array.isArray(app?.languages)
      ? (app.languages as { language: string }[]).map((l) => l.language)
      : []

    return {
      id: op.id,
      displayName: op.displayName,
      operatorCode: op.operatorCode,
      status: op.status,
      languages,
      location: app?.location ?? null,
      joinedAt: op.createdAt.toISOString(),
      totalReviews,
      reviewsToday,
      reviews7d,
      reviews30d,
      decisionBreakdown: { exploited, defended, escalated, inconclusive },
      exploitRate,
      vulnTagBreakdown,
      avgReviewTimeMs,
      medianReviewTimeMs,
      calibrationAttempts,
      calibrationPassed,
      calibrationPassRate,
      calibrationAvgScore,
      consensusTotal,
      consensusAgreed,
      consensusAgreementRate,
    }
  })

  result.sort((a, b) => b.totalReviews - a.totalReviews)

  const globalStats = {
    totalOperators: operators.length,
    activeOperators: operators.filter((o) => o.status === 'active').length,
    totalReviews: allDecisions.length,
    avgReviewsPerOperator: operators.length > 0
      ? Math.round(allDecisions.length / operators.length)
      : 0,
    totalCalibrationAttempts: allCalibration.length,
    totalConsensusPairs: allConsensusPairs.length,
  }

  return { operators: result, globalStats }
}
