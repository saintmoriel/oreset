import type { MediaType, BatchStatus } from '@oreset/shared'
import { apiFetch } from '../client'

export type Batch = {
  id: string
  campaignId: string | null
  type: MediaType
  title: string
  itemCount: number
  rateMinorUnits: number
  currency: string
  status: BatchStatus
  brief: string | null
  guidelines: string[] | null
  requiredPermissions: string[] | null
  createdAt: string
  updatedAt: string
  campaign?: { language: string | null; domain: string | null } | null
}

export function listAvailableBatches() {
  return apiFetch<{ batches: Batch[] }>('/api/v1/batches')
}

export function getBatch(id: string) {
  return apiFetch<{ batch: Batch }>(`/api/v1/batches/${id}`)
}
