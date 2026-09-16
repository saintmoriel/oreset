import type { VulnTag, ExploitStatus, OperatorDecision, Severity, ClientQueueItemStatus } from '@oreset/shared'
import { apiFetch } from '../client'

export type BuyerCase = {
  id: string
  clientName: string
  externalRef: string
  content: string
  traceData: Record<string, unknown> | null
  status: ClientQueueItemStatus
  requiresDualSolve: boolean
  createdAt: string
}

export type BuyerCaseDecision = {
  id: string
  operatorId: string
  decision: OperatorDecision
  vulnTag: VulnTag | null
  severity: Severity | null
  exploitStatus: ExploitStatus | null
  notes: string | null
  reproductionSteps: string | null
  recommendedFix: string | null
  reviewTimeMs: number | null
  createdAt: string
}

export type BuyerCaseDetail = {
  item: BuyerCase
  decisions: BuyerCaseDecision[]
}

export type BuyerCaseStats = {
  total: number
  pending: number
  exploited: number
  defended: number
  escalated: number
  inconclusive: number
  consensusSplit: number
}

export type BuyerRegressionTestCase = {
  testCaseId: string
  externalRef: string
  domain: string | null
  language: string | null
  attackPrompt: string | null
  modelResponse: string | null
  vulnTag: VulnTag | null
  severity: Severity | null
  exploitStatus: ExploitStatus | null
  decision: string
  reproductionSteps: string | null
  recommendedFix: string | null
  reviewerNotes: string | null
  reviewedAt: string
}

export function submitBuyerCase(data: {
  clientName: string
  externalRef: string
  content: string
  traceData?: Record<string, unknown>
  requiresDualSolve?: boolean
}) {
  return apiFetch<{ item: BuyerCase }>('/api/v1/buyer/cases', {
    method: 'POST',
    body: data,
  })
}

export function getMyBuyerCases(status?: string) {
  const qs = status && status !== 'all' ? `?status=${status}` : ''
  return apiFetch<{ cases: BuyerCase[] }>(`/api/v1/buyer/cases${qs}`)
}

export function getMyBuyerCaseDetail(id: string) {
  return apiFetch<BuyerCaseDetail>(`/api/v1/buyer/cases/${id}`)
}

export function getMyBuyerCaseStats() {
  return apiFetch<BuyerCaseStats>('/api/v1/buyer/cases/stats')
}

export function getMyBuyerRegressions(format: 'json' | 'jsonl' = 'json') {
  return apiFetch<{
    testSuite: { generatedAt: string; platform: string; version: string; totalCases: number }
    testCases: BuyerRegressionTestCase[]
  }>(`/api/v1/buyer/regressions?format=${format}`)
}
