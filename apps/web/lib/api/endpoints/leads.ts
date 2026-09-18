import { apiFetch } from '../client'

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed'

export type Lead = {
  id: string
  kind: 'pilot' | 'contact'
  name: string
  email: string
  organization: string | null
  agentType: string | null
  languages: string | null
  audience: string | null
  message: string
  status: LeadStatus
  notes: string | null
  handledBy: string | null
  handledAt: string | null
  sourcePath: string | null
  userAgent: string | null
  createdAt: string
}

export function submitLead(input: {
  kind: 'pilot' | 'contact'
  name: string
  email: string
  organization?: string
  agentType?: string
  languages?: string
  audience?: string
  message: string
  sourcePath?: string
  website?: string
}) {
  return apiFetch<{ id: string; receivedAt: string }>('/api/v1/leads', { method: 'POST', body: input })
}

export function listLeads(status?: string) {
  const qs = status && status !== 'all' ? `?status=${status}` : ''
  return apiFetch<{ leads: Lead[] }>(`/api/v1/admin/leads${qs}`)
}

export function updateLead(id: string, input: { status?: LeadStatus; notes?: string }) {
  return apiFetch<{ lead: Lead }>(`/api/v1/admin/leads/${id}`, { method: 'PATCH', body: input })
}
