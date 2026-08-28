import type { PayoutStatus } from '@oreset/shared'
import { apiFetch } from '../client'

export type Payout = {
  id: string
  contributorId: string
  amountMinorUnits: number
  currency: string
  status: PayoutStatus
  provider: string
  providerReference: string | null
  createdAt: string
  updatedAt: string
}

export type AdminPayout = Payout & {
  contributor: { id: string; displayName: string | null; phone: string | null }
}

export function getMyPayouts() {
  return apiFetch<{ payouts: Payout[] }>('/api/v1/payouts/me')
}

export function setPayoutDetails(input: Record<string, unknown>) {
  return apiFetch<{ ok: true }>('/api/v1/payouts/me/details', { method: 'POST', body: input })
}

export function runPayoutBatch() {
  return apiFetch<{ payoutsCreated: number }>('/api/v1/admin/payouts/run', { method: 'POST' })
}

export function runRetentionSweep() {
  return apiFetch<{ deletedCount: number }>('/api/v1/admin/retention/run', { method: 'POST' })
}

export function listAllPayouts() {
  return apiFetch<{ payouts: AdminPayout[] }>('/api/v1/admin/payouts')
}
