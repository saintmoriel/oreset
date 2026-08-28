import type { ErrTag, MediaType, QaDecision } from '@oreset/shared'
import type { CaptureValidationResult } from '@/components/capture/capture-session-context'
import type { Batch } from './batches'
import { apiFetch } from '../client'

export type QaQueueItem = {
  id: string
  mediaType: MediaType
  durationSeconds: string | null
  imageMetadata: Record<string, unknown> | null
  createdAt: string
  batch: Batch
  latestValidation: CaptureValidationResult | null
  downloadUrl: string
}

export type QaStats = {
  queueRemaining: number
  reviewedToday: number
  reviewedAllTime: number
  approvedAllTime: number
  rejectedAllTime: number
  approvalRate: number | null
  defectTagBreakdown: Record<ErrTag, number>
}

export type QaDecisionRecord = {
  id: string
  decision: QaDecision
  defectTag: ErrTag | null
  notes: string | null
  createdAt: string
  submission: {
    id: string
    mediaType: MediaType
    batch: Batch
  }
}

export function getQaQueue() {
  return apiFetch<{ items: QaQueueItem[] }>('/api/v1/qa/queue')
}

export function submitQaDecision(
  submissionId: string,
  input: { decision: QaDecision; defectTag?: ErrTag; notes?: string },
) {
  return apiFetch<{ submission: { id: string; status: string } }>(
    `/api/v1/qa/items/${submissionId}/decision`,
    { method: 'POST', body: input },
  )
}

export function getMyQaStats() {
  return apiFetch<QaStats>('/api/v1/qa/me/stats')
}

export function getMyQaDecisions() {
  return apiFetch<{ decisions: QaDecisionRecord[] }>('/api/v1/qa/me/decisions')
}
