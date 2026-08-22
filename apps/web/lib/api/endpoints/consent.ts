import { apiFetch } from '../client'

export type ConsentRecord = {
  id: string
  contributorId: string
  batchId: string | null
  consentTextVersion: string
  consentedAt: string
  consentHash: string | null
}

export function recordConsent(batchId?: string) {
  return apiFetch<{ consentRecord: ConsentRecord }>('/api/v1/consent', {
    method: 'POST',
    body: { batchId },
  })
}
