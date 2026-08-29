import { apiFetch } from '../client'

export type RegressionStats = {
  rejectedCount: number
  correctedCount: number
  totalTestCases: number
  clients: string[]
}

export type RegressionTestCase = {
  test_case_id: string
  external_ref: string
  client_name: string | null
  domain: string | null
  language: string | null
  source_input: string | null
  model_executed_output: string | null
  ground_truth_correct_output: string | null
  corrected_transcript: string | null
  corrected_intent: string | null
  error_taxonomy: string[]
  severity: string | null
  decision: string
  reviewer_notes: string | null
  reviewed_at: string
  status: 'FAILED_PRODUCTION_GATE' | 'CORRECTED_PASS'
}

export type RegressionSuiteResponse = {
  test_suite: {
    generated_at: string
    platform: string
    version: string
    total_cases: number
  }
  test_cases: RegressionTestCase[]
}

export function getRegressionStats() {
  return apiFetch<RegressionStats>('/api/v1/admin/regressions/stats')
}

export function getRegressionSuite(params?: { client?: string; since?: string; limit?: number }) {
  const query = new URLSearchParams()
  if (params?.client) query.set('client', params.client)
  if (params?.since) query.set('since', params.since)
  if (params?.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return apiFetch<RegressionSuiteResponse>(`/api/v1/admin/regressions${qs ? `?${qs}` : ''}`)
}
