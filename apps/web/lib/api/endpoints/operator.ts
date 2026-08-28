import type { ErrTag, OperatorDecision, Severity, TicketStatus } from '@oreset/shared'
import { apiFetch } from '../client'

export type OperatorQueueItem = {
  id: string
  clientName: string
  externalRef: string
  content: string
  status: string
  createdAt: string
}

export type OperatorStats = {
  queueRemaining: number
  reviewedToday: number
  reviewedAllTime: number
  approvedAllTime: number
  escalatedAllTime: number
  rejectedAllTime: number
  approvalRate: number | null
  errTagBreakdown: Record<ErrTag, number>
  openTicketsFromMe: number
}

export type OperatorDecisionRecord = {
  id: string
  decision: OperatorDecision
  errTag: ErrTag | null
  severity: Severity | null
  notes: string | null
  createdAt: string
  clientItemId: string
  clientItemSnapshot: { content?: string; clientName?: string } | null
  ticket: { status: TicketStatus; resolvedAt: string | null } | null
}

export function getOperatorQueue() {
  return apiFetch<{ items: OperatorQueueItem[] }>('/api/v1/operator/queue')
}

export function submitOperatorDecision(
  itemId: string,
  input: { decision: OperatorDecision; errTag?: ErrTag; severity?: Severity; notes?: string },
) {
  return apiFetch<{ item: OperatorQueueItem }>(`/api/v1/operator/items/${itemId}/decision`, {
    method: 'POST',
    body: input,
  })
}

export function getMyOperatorStats() {
  return apiFetch<OperatorStats>('/api/v1/operator/me/stats')
}

export function getMyOperatorDecisions() {
  return apiFetch<{ decisions: OperatorDecisionRecord[] }>('/api/v1/operator/me/decisions')
}
