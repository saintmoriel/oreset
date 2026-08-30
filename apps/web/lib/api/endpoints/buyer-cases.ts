import type { ErrTag, OperatorDecision, Severity, ClientQueueItemStatus } from '@oreset/shared'
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
  errTag: ErrTag | null
  severity: Severity | null
  notes: string | null
  correctedTranscript: string | null
  correctedIntent: string | null
  correctedOutcome: string | null
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
  approved: number
  corrected: number
  rejected: number
  escalated: number
  consensusSplit: number
}

export type BuyerRegressionTestCase = {
  testCaseId: string
  externalRef: string
  domain: string | null
  language: string | null
  sourceInput: string | null
  modelOutput: string | null
  groundTruth: string | null
  correctedTranscript: string | null
  correctedIntent: string | null
  errTag: ErrTag | null
  severity: Severity | null
  decision: string
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
