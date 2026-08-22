import type { MediaType, SubmissionStatus } from '@oreset/shared'
import type { CaptureValidationResult, GeoLocation } from '@/components/capture/capture-session-context'
import type { Batch } from './batches'
import { apiFetch } from '../client'

export type CreateSubmissionInput = {
  batchId: string
  consentRecordId: string
  mediaType: MediaType
  storageKey: string
  fileSizeBytes: number
  mimeType: string
  durationSeconds?: number
  imageMetadata?: Record<string, unknown>
  capturedAt: string // ISO
  deviceInfo: Record<string, unknown>
  geoLocation?: GeoLocation
}

export type SubmissionSummary = {
  id: string
  status: SubmissionStatus
  mediaType: MediaType
  createdAt: string
  batch: Batch
  latestValidation: CaptureValidationResult | null
}

export function createSubmission(input: CreateSubmissionInput) {
  return apiFetch<{ submission: { id: string; status: SubmissionStatus }; validation: CaptureValidationResult }>(
    '/api/v1/submissions',
    { method: 'POST', body: input },
  )
}

export function listMySubmissions() {
  return apiFetch<{ submissions: SubmissionSummary[] }>('/api/v1/submissions/me')
}
