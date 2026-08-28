import type { DatasetStatus, MediaType } from '@oreset/shared'
import type { Campaign } from './campaigns'
import { apiFetch } from '../client'

export type Dataset = {
  id: string
  title: string
  campaignId: string
  buyerId: string | null
  licenseTerms: string
  status: DatasetStatus
  provenanceHash: string | null
  sealedAt: string | null
  deliveredAt: string | null
  createdBy: string
  createdAt: string
}

export type DatasetItemSubmission = {
  id: string
  mediaType: MediaType
  mimeType: string
  fileSizeBytes: number
  durationSeconds: string | null
  createdAt: string
}

export type DatasetWithRelations = Dataset & {
  campaign: Campaign
  buyer: { id: string; email: string | null; displayName: string | null } | null
  items: { id: string; submissionId: string; submission: DatasetItemSubmission }[]
}

export type UnassembledSubmission = {
  id: string
  mediaType: MediaType
  mimeType: string
  fileSizeBytes: number
  durationSeconds: string | null
  createdAt: string
  batch: { id: string; title: string }
  contributor: { id: string; displayName: string | null }
}

export type Buyer = { id: string; email: string | null; displayName: string | null; createdAt: string }

export function listDatasets() {
  return apiFetch<{ datasets: DatasetWithRelations[] }>('/api/v1/admin/datasets')
}

export function getDataset(id: string) {
  return apiFetch<{ dataset: DatasetWithRelations }>(`/api/v1/admin/datasets/${id}`)
}

export function createDataset(input: { title: string; campaignId: string; licenseTerms: string }) {
  return apiFetch<{ dataset: Dataset }>('/api/v1/admin/datasets', { method: 'POST', body: input })
}

export function getUnassembledSubmissions(datasetId: string) {
  return apiFetch<{ submissions: UnassembledSubmission[] }>(`/api/v1/admin/datasets/${datasetId}/unassembled`)
}

export function addDatasetItems(datasetId: string, submissionIds: string[]) {
  return apiFetch<{ added: number }>(`/api/v1/admin/datasets/${datasetId}/items`, {
    method: 'POST',
    body: { submissionIds },
  })
}

export function removeDatasetItem(datasetId: string, submissionId: string) {
  return apiFetch<{ ok: true }>(`/api/v1/admin/datasets/${datasetId}/items/${submissionId}`, {
    method: 'DELETE',
  })
}

export function sealDataset(datasetId: string) {
  return apiFetch<{ dataset: Dataset }>(`/api/v1/admin/datasets/${datasetId}/seal`, { method: 'POST' })
}

export function handoffDataset(datasetId: string, buyerId: string) {
  return apiFetch<{ dataset: Dataset }>(`/api/v1/admin/datasets/${datasetId}/handoff`, {
    method: 'POST',
    body: { buyerId },
  })
}

export function listBuyers() {
  return apiFetch<{ buyers: Buyer[] }>('/api/v1/admin/buyers')
}

export function provisionBuyer(input: { email: string; password: string; displayName: string }) {
  return apiFetch<{ user: { id: string } }>('/api/v1/admin/buyers', { method: 'POST', body: input })
}
