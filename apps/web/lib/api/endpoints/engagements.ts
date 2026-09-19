import { apiFetch } from '../client'
import type { EngagementPhase, EngagementTier } from '@oreset/shared'

export type Engagement = {
  id: string
  buyerId: string
  name: string
  agentName: string
  tier: EngagementTier
  phase: EngagementPhase
  scope: string
  rules: string
  rulesVersion: number
  startsAt: string | null
  endsAt: string | null
  retestUntil: string | null
  createdAt: string
  updatedAt: string
  scenarioCount?: number
}

export type EngagementInput = {
  name: string
  agentName: string
  tier: EngagementTier
  phase?: EngagementPhase
  scope?: string
  rules?: string
  startsAt?: string | null
  endsAt?: string | null
  retestUntil?: string | null
}

// Owner / Client Success
export function listEngagements(buyerId: string) {
  return apiFetch<{ engagements: Engagement[] }>(`/api/v1/admin/engagements?buyerId=${encodeURIComponent(buyerId)}`)
}

export function createEngagement(input: EngagementInput & { buyerId: string }) {
  return apiFetch<Engagement>('/api/v1/admin/engagements', { method: 'POST', body: input })
}

export function updateEngagement(id: string, input: Partial<EngagementInput>) {
  return apiFetch<Engagement>(`/api/v1/admin/engagements/${id}`, { method: 'PATCH', body: input })
}

// Client
export type MyEngagements = { current: Engagement | null; engagements: Engagement[] }

// Tester
export type EngagementRules = {
  id: string
  name: string
  agentName: string
  tier: EngagementTier
  phase: EngagementPhase
  scope: string
  rules: string
  rulesVersion: number
  acknowledged: boolean
  acknowledgedAt: string | null
}

export function getEngagementRules(id: string) {
  return apiFetch<EngagementRules>(`/api/v1/operator/engagements/${id}`)
}

export function acknowledgeEngagementRules(id: string) {
  return apiFetch<{ acknowledgedAt: string; rulesVersion: number }>(`/api/v1/operator/engagements/${id}/acknowledge`, { method: 'POST' })
}
