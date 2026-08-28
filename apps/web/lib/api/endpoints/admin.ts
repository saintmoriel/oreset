import { apiFetch } from '../client'
import type { AuditLogEntry } from './audit'

export type AdminOverview =
  | {
      role: 'admin'
      campaignsLive: number
      datasetsByStatus: { draft: number; sealed: number; delivered: number }
      submissionsAwaitingQa: number
      clientItemsAwaitingReview: number
      openTickets: number
      pendingOperatorApplications: number
      submissionsAwaitingPayout: number
      needsAttention: number
      recentAuditEntries: AuditLogEntry[]
    }
  | { role: 'reviewer_lead'; openTickets: number }
  | { role: 'compliance'; recentAuditEntries: AuditLogEntry[] }

export function getAdminOverview() {
  return apiFetch<AdminOverview>('/api/v1/admin/overview')
}
