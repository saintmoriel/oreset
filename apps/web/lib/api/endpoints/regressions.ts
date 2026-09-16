import type { VulnTag, ExploitStatus, Severity } from '@oreset/shared'
import { apiFetch } from '../client'

export type RegressionStats = {
  exploitedCount: number
  defendedCount: number
  totalTestCases: number
  clients: string[]
}

// Snake_case on purpose: this is the CI/CD export format clients consume.
export type RegressionTestCase = {
  test_case_id: string
  external_ref: string
  client_name: string | null
  domain: string | null
  language: string | null
  attack_prompt: string | null
  model_response: string | null
  vuln_tag: VulnTag | null
  exploit_status: ExploitStatus | null
  severity: Severity | null
  reproduction_steps: string | null
  recommended_fix: string | null
  decision: string
  reviewer_notes: string | null
  reviewed_at: string
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
