import { apiFetch } from '../client'

export type ConsentRecordSummary = {
  id: string
  batchId: string | null
  consentedAt: string
  batch: { title: string } | null
}

export function getDataExport() {
  return apiFetch<Record<string, unknown>>('/api/v1/me/data-export')
}

export function getMyConsentRecords() {
  return apiFetch<{ consentRecords: ConsentRecordSummary[] }>('/api/v1/me/consent-records')
}

export function deleteAccount() {
  return apiFetch<{ ok: true }>('/api/v1/me/delete-account', { method: 'POST' })
}
