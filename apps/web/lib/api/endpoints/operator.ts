import type { ErrTag, OperatorDecision, Severity } from '@oreset/shared'
import { apiFetch } from '../client'

export type OperatorQueueItem = {
  id: string
  clientName: string
  externalRef: string
  content: string
  status: string
  createdAt: string
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
