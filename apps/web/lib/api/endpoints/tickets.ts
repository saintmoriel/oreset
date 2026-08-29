import type { ErrTag, Severity, TicketStatus } from '@oreset/shared'
import { apiFetch } from '../client'

export type TicketReviewDecision = {
  id: string
  operatorId: string
  clientItemId: string
  clientItemSnapshot: {
    content?: string
    clientName?: string
    traceData?: Record<string, unknown>
  } | null
  decision: string
  errTag: ErrTag | null
  severity: Severity | null
  notes: string | null
  correctedTranscript: string | null
  correctedIntent: string | null
  correctedOutcome: string | null
  createdAt: string
}

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
  operatorReviewDecision: TicketReviewDecision | null
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
