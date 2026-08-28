import { apiFetch } from '../client'

export type AuditLogEntry = {
  id: string
  actorId: string | null
  actorLabel: string
  actorRole: string
  action: string
  resourceType: string | null
  resourceId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

export type AuditLogFilters = { action?: string; actorRole?: string; resourceType?: string }

export function getAuditLog(filters: AuditLogFilters = {}) {
  const params = new URLSearchParams()
  if (filters.action) params.set('action', filters.action)
  if (filters.actorRole) params.set('actorRole', filters.actorRole)
  if (filters.resourceType) params.set('resourceType', filters.resourceType)
  const qs = params.toString()
  return apiFetch<{ entries: AuditLogEntry[] }>(`/api/v1/audit${qs ? `?${qs}` : ''}`)
}
