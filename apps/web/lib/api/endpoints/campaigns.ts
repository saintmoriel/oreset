import type { MediaType, CampaignStatus } from '@oreset/shared'
import type { Batch } from './batches'
import { apiFetch } from '../client'

export type Campaign = {
  id: string
  title: string
  status: CampaignStatus
  mediaType: MediaType
  language: string | null
  domain: string | null
  payRateMinorUnits: number | null
  currency: string
  materials: Record<string, unknown> | null
  cohort: string | null
  createdBy: string | null
  launchedAt: string | null
  createdAt: string
  updatedAt: string
  batches: Batch[]
}

export type CreateCampaignInput = {
  title: string
  mediaType: MediaType
  language?: string
  domain?: string
  itemCount: number
  payRateMinorUnits: number
  cohort?: string
  materials?: Record<string, unknown>
}

export function listCampaigns() {
  return apiFetch<{ campaigns: Campaign[] }>('/api/v1/campaigns')
}

export function createCampaign(input: CreateCampaignInput) {
  return apiFetch<{ campaign: Campaign; batch: Batch }>('/api/v1/campaigns', {
    method: 'POST',
    body: input,
  })
}
