import { and, count, eq, isNull } from 'drizzle-orm'
import type { StaffRole } from '@oreset/shared'
import { db } from '../../db/client'
import { campaigns, users, submissions } from '../../db/schema'
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
