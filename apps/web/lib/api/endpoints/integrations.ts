import { apiFetch } from '../client'

// ---------------------------------------------------------------------------
// API tokens (read-only machine access for CI)
// ---------------------------------------------------------------------------

export type ApiToken = {
  id: string
  name: string
  tokenPrefix: string
  scopes: string[]
  lastUsedAt: string | null
  expiresAt: string | null
  revokedAt: string | null
  createdAt: string
}

export function listApiTokens() {
  return apiFetch<{ tokens: ApiToken[] }>('/api/v1/buyer/api-tokens')
}

export function createApiToken(input: { name: string; expiresInDays?: number }) {
  return apiFetch<{ token: ApiToken; secret: string }>('/api/v1/buyer/api-tokens', { method: 'POST', body: input })
}

export function revokeApiToken(id: string) {
  return apiFetch<{ token: ApiToken }>(`/api/v1/buyer/api-tokens/${id}`, { method: 'DELETE' })
}

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

export const WEBHOOK_EVENTS: { key: string; label: string }[] = [
  { key: 'finding.verified', label: 'Finding verified by a lead auditor' },
  { key: 'finding.closed', label: 'Finding closed after a passing retest' },
  { key: 'finding.reopened', label: 'Finding reopened after a failing retest' },
  { key: 'case.completed', label: 'Scenario assessed (exploited or defended)' },
  { key: 'case.escalated', label: 'Scenario escalated to a lead auditor' },
  { key: 'case.consensus_split', label: 'Two testers disagreed on a scenario' },
  { key: 'case.adjudicated', label: 'Disagreement adjudicated' },
]

export type WebhookConfig = {
  id: string
  url: string
  secret: string // masked on list, full on create and rotate
  events: string[]
  active: boolean
  description: string | null
  lastTriggeredAt: string | null
  lastStatus: string | null
  createdAt: string
  updatedAt: string
}

export function listWebhooks() {
  return apiFetch<{ webhooks: WebhookConfig[] }>('/api/v1/buyer/webhooks')
}

export function createWebhook(input: { url: string; events: string[]; description?: string }) {
  return apiFetch<{ webhook: WebhookConfig }>('/api/v1/buyer/webhooks', { method: 'POST', body: input })
}

export function updateWebhook(id: string, input: { url?: string; events?: string[]; description?: string; active?: boolean }) {
  return apiFetch<{ webhook: WebhookConfig }>(`/api/v1/buyer/webhooks/${id}`, { method: 'PATCH', body: input })
}

export function deleteWebhook(id: string) {
  return apiFetch<void>(`/api/v1/buyer/webhooks/${id}`, { method: 'DELETE' })
}

export function rotateWebhookSecret(id: string) {
  return apiFetch<{ webhook: WebhookConfig }>(`/api/v1/buyer/webhooks/${id}/rotate`, { method: 'POST' })
}
