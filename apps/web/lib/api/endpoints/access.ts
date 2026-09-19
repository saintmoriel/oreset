import { apiFetch } from '../client'
import type { AdminModule, StaffRole } from '@oreset/shared'

export type ModuleCatalogueEntry = {
  module: AdminModule
  label: string
  held: boolean
  byRole: boolean
  grant: { expiresAt: string | null } | null
  pendingRequest: boolean
}

export type MyAccessRequest = {
  id: string
  module: AdminModule
  reason: string
  status: 'pending' | 'approved' | 'denied'
  decisionNote: string | null
  decidedAt: string | null
  createdAt: string
}

export type MyAccess = {
  staffRole: StaffRole | null
  modules: AdminModule[]
  canApprove: boolean
  catalogue: ModuleCatalogueEntry[]
  requests: MyAccessRequest[]
}

export type PendingAccessRequest = {
  id: string
  module: AdminModule
  moduleLabel: string
  reason: string
  createdAt: string
  user: { id: string; displayName: string | null; email: string; staffRole: StaffRole | null }
}

export type ActiveGrantRow = {
  user: { id: string; displayName: string | null; email: string; staffRole: StaffRole | null }
  grants: { id: string; module: AdminModule; moduleLabel: string; reason: string; expiresAt: string | null }[]
}

export function getMyAccess() {
  return apiFetch<MyAccess>('/api/v1/admin/access/me')
}

export function requestModuleAccess(module: AdminModule, reason: string) {
  return apiFetch<{ id: string }>('/api/v1/admin/access/requests', { method: 'POST', body: { module, reason } })
}

export function getPendingAccess() {
  return apiFetch<{ requests: PendingAccessRequest[]; grants: ActiveGrantRow[] }>('/api/v1/admin/access/pending')
}

export function decideAccessRequest(id: string, input: { decision: 'approved' | 'denied'; note?: string; expiresInDays?: number }) {
  return apiFetch<{ grantId: string | null }>(`/api/v1/admin/access/requests/${id}/decide`, { method: 'POST', body: input })
}

export function grantModule(input: { userId: string; module: AdminModule; reason: string; expiresInDays?: number }) {
  return apiFetch<{ id: string }>('/api/v1/admin/access/grants', { method: 'POST', body: input })
}

export function revokeGrant(id: string) {
  return apiFetch<void>(`/api/v1/admin/access/grants/${id}`, { method: 'DELETE' })
}

// Which module a console path belongs to. Home and Access need none.
export const PATH_MODULES: { prefix: string; module: AdminModule }[] = [
  { prefix: '/admin/leads', module: 'leads' },
  { prefix: '/admin/findings', module: 'findings' },
  { prefix: '/admin/tickets', module: 'escalations' },
  { prefix: '/admin/consensus', module: 'consensus' },
  { prefix: '/admin/calibration', module: 'calibration' },
  { prefix: '/admin/regressions', module: 'regressions' },
  { prefix: '/admin/testers', module: 'testers' },
  { prefix: '/admin/applications', module: 'testers' },
  { prefix: '/admin/clients', module: 'clients' },
  { prefix: '/admin/people', module: 'people' },
  { prefix: '/admin/payouts', module: 'payouts' },
  { prefix: '/admin/audit-log', module: 'audit' },
]
