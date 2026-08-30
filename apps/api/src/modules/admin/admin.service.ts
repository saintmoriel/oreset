import { and, avg, count, desc, eq, gte, isNull, sql } from 'drizzle-orm'
import type { StaffRole } from '@oreset/shared'
import { ERR_TAGS, type ErrTag } from '@oreset/shared'
import { db } from '../../db/client'
import { campaigns, users, submissions, operatorReviewDecisions, calibrationAttempts, consensusPairs, operatorApplications } from '../../db/schema'
import { getQueueCount as getQaQueueCount } from '../qa/qa.service'
import { getQueueCount as getOperatorQueueCount } from '../operator/operator.service'
import { listDatasets } from '../datasets/datasets.service'
import { listTickets } from '../tickets/tickets.service'
import { listAuditLog } from '../audit/audit.service'

async function countCampaignsLive() {
  const [row] = await db.select({ n: count() }).from(campaigns).where(eq(campaigns.status, 'live'))
  return row.n
}

async function countPendingOperatorApplications() {
  const [row] = await db
    .select({ n: count() })
    .from(users)
    .where(and(eq(users.role, 'operator'), eq(users.status, 'pending')))
  return row.n
}

async function countSubmissionsAwaitingPayout() {
  const [row] = await db
    .select({ n: count() })
    .from(submissions)
    .where(and(eq(submissions.status, 'qa_approved'), isNull(submissions.payoutId)))
  return row.n
}

async function getAdminOverview() {
  const [
    campaignsLive,
    allDatasets,
    submissionsAwaitingQa,
    clientItemsAwaitingReview,
    tickets,
    pendingOperatorApplications,
    submissionsAwaitingPayout,
    recentAuditEntries,
  ] = await Promise.all([
    countCampaignsLive(),
    listDatasets(),
    getQaQueueCount(),
    getOperatorQueueCount(),
    listTickets(),
    countPendingOperatorApplications(),
    countSubmissionsAwaitingPayout(),
    listAuditLog({ limit: 8 }),
  ])

  const datasetsByStatus = { draft: 0, sealed: 0, delivered: 0 }
  for (const d of allDatasets) datasetsByStatus[d.status]++
  const openTickets = tickets.filter((t) => t.status === 'open').length

  return {
    role: 'admin' as const,
    campaignsLive,
    datasetsByStatus,
    submissionsAwaitingQa,
    clientItemsAwaitingReview,
    openTickets,
    pendingOperatorApplications,
    submissionsAwaitingPayout,
    needsAttention: openTickets + pendingOperatorApplications + submissionsAwaitingPayout,
    recentAuditEntries,
  }
}

async function getReviewerLeadOverview() {
  const tickets = await listTickets()
  return { role: 'reviewer_lead' as const, openTickets: tickets.filter((t) => t.status === 'open').length }
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
      errTag: true,
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

    const approved = decisions.filter((d) => d.decision === 'approved').length
    const corrected = decisions.filter((d) => d.decision === 'corrected').length
    const rejected = decisions.filter((d) => d.decision === 'rejected').length
    const escalated = decisions.filter((d) => d.decision === 'escalated').length
    const declined = decisions.filter((d) => d.decision === 'declined').length
    const approvalRate = totalReviews > 0 ? Math.round((approved / totalReviews) * 100) : null

    const errTagBreakdown = Object.fromEntries(ERR_TAGS.map((tag) => [tag, 0])) as Record<ErrTag, number>
    for (const d of decisions) {
      if (d.errTag) errTagBreakdown[d.errTag] += 1
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
      decisionBreakdown: { approved, corrected, rejected, escalated, declined },
      approvalRate,
      errTagBreakdown,
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
