import type { CampaignStatus, DatasetStatus, MediaType } from '@oreset/shared'
import { apiFetch } from '../client'

export type MyDataset = {
  id: string
  title: string
  campaignId: string
  buyerId: string
  licenseTerms: string
  status: DatasetStatus
  provenanceHash: string | null
  sealedAt: string | null
  deliveredAt: string
  createdAt: string
  campaign: { id: string; title: string; status: CampaignStatus; language: string | null; domain: string | null }
  items: { id: string }[]
}

export type MyDatasetItem = {
  id: string
  mediaType: MediaType
  mimeType: string
  durationSeconds: string | null
  downloadUrl: string | null
  lastDownloadedAt: string | null
}

export type MyDatasetDetail = Omit<MyDataset, 'items'> & { items: MyDatasetItem[] }

export type BuyerStats = {
  itemsLicensed: number
  datasetsDelivered: number
  downloadsTotal: number
  lastDeliveredAt: string | null
}

export type BuyerDownloadRecord = {
  id: string
  createdAt: string
  dataset: { id: string; title: string }
  submission: { id: string; mediaType: MediaType }
}

export function getMyDatasets() {
  return apiFetch<{ datasets: MyDataset[] }>('/api/v1/buyer/datasets')
}

export function getMyDatasetDetail(id: string) {
  return apiFetch<{ dataset: MyDatasetDetail }>(`/api/v1/buyer/datasets/${id}`)
}

export function getMyBuyerStats() {
  return apiFetch<BuyerStats>('/api/v1/buyer/me/stats')
}

export function getMyBuyerDownloads() {
  return apiFetch<{ downloads: BuyerDownloadRecord[] }>('/api/v1/buyer/me/downloads')
}
