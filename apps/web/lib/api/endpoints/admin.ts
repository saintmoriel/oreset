import { apiFetch } from '../client'
import type { AuditLogEntry } from './audit'

export type AdminOverview =
  | {
      role: 'admin'
      needsAttention: number
      findingsAwaitingVerification: number
      openEscalations: number
      consensusSplits: number
      pendingTesterApplications: number
      activeClients: number
      scenariosQueued: number
      retestsQueued: number
      findingsOpen: number
      findingsInRetest: number
      findingsClosed: number
      scenariosAssessed7d: number
      exploited7d: number
      exploitRate7d: number | null
      totalVerified: number
      falsePositiveRate: number | null
      recentAuditEntries: AuditLogEntry[]
    }
  | {
      role: 'reviewer_lead'
      findingsAwaitingVerification: number
      openEscalations: number
      consensusSplits: number
    }
  | { role: 'compliance'; recentAuditEntries: AuditLogEntry[] }

export function getAdminOverview() {
  return apiFetch<AdminOverview>('/api/v1/admin/overview')
}
