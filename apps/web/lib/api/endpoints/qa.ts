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
