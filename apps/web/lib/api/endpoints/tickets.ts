import type { ErrTag, Severity, TicketStatus } from '@oreset/shared'
import { apiFetch } from '../client'

export type Ticket = {
  id: string
  operatorReviewDecisionId: string
  clientName: string
  externalRef: string
  errTag: ErrTag | null
  severity: Severity | null
  notes: string | null
  status: TicketStatus
  resolvedBy: string | null
  resolvedAt: string | null
  resolutionNotes: string | null
  createdAt: string
  resolvedByUser: { id: string; displayName: string | null } | null
}

export function listTickets() {
  return apiFetch<{ tickets: Ticket[] }>('/api/v1/admin/tickets')
}

export function resolveTicket(id: string, resolutionNotes?: string) {
  return apiFetch<{ ticket: Ticket }>(`/api/v1/admin/tickets/${id}/resolve`, {
    method: 'POST',
    body: { resolutionNotes },
  })
}
