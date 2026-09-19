import { apiFetch } from '../client'
import type { AdminModule, StaffRole } from '@oreset/shared'
import type { AuditLogEntry } from './audit'
import type { BusinessNumbers } from './people'

export type AdminOverview =
  | {
      role: 'admin'
      needsAttention: number
      newLeads: number
      pendingAccessRequests: number
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
      business: BusinessNumbers
      recentAuditEntries: AuditLogEntry[]
    }
  | {
      role: 'reviewer_lead'
      findingsAwaitingVerification: number
      openEscalations: number
      consensusSplits: number
    }
  | { role: 'compliance'; recentAuditEntries: AuditLogEntry[] }
  | { role: 'generic'; staffRole: StaffRole; modules: AdminModule[] }

export function getAdminOverview() {
  return apiFetch<AdminOverview>('/api/v1/admin/overview')
}
