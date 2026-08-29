import type { ErrTag, OperatorDecision, Severity } from '@oreset/shared'
import { apiFetch } from '../client'

export type CalibrationCase = {
  id: string
  title: string
  content: string
  traceData: Record<string, unknown> | null
  domain: string | null
  language: string | null
}

export type CalibrationCaseFull = CalibrationCase & {
  expectedDecision: OperatorDecision
  expectedErrTag: ErrTag | null
  expectedSeverity: Severity | null
  expectedOutcome: string | null
  explanation: string
  status: 'active' | 'retired'
  createdBy: string
  createdAt: string
  createdByUser?: { displayName: string | null }
}

export type CalibrationAttempt = {
  id: string
  calibrationCaseId: string
  operatorId: string
  decision: OperatorDecision
  errTag: ErrTag | null
  severity: Severity | null
  correctedOutcome: string | null
  notes: string | null
  reviewTimeMs: number | null
  result: 'pass' | 'fail'
  score: number
  createdAt: string
  calibrationCase?: { title: string; expectedDecision: OperatorDecision }
}

export type CalibrationFeedback = {
  result: 'pass' | 'fail'
  score: number
  expectedDecision: OperatorDecision
  expectedErrTag: ErrTag | null
  expectedSeverity: Severity | null
  explanation: string
}

export type CalibrationStats = {
  activeCases: number
  totalAttempts: number
  overallPassRate: number | null
  avgScore: number | null
  operatorStats: {
    operatorId: string
    attempts: number
    passed: number
    passRate: number
    avgScore: number
  }[]
}

// Admin
export function listCalibrationCases() {
  return apiFetch<{ cases: CalibrationCaseFull[] }>('/api/v1/calibration/cases')
}

export function createCalibrationCase(data: {
  title: string
  content: string
  traceData?: Record<string, unknown>
  expectedDecision: OperatorDecision
  expectedErrTag?: ErrTag
  expectedSeverity?: Severity
  expectedOutcome?: string
  explanation: string
  domain?: string
  language?: string
}) {
  return apiFetch<{ calibrationCase: CalibrationCaseFull }>('/api/v1/calibration/cases', {
    method: 'POST',
    body: data,
  })
}

export function retireCalibrationCase(id: string) {
  return apiFetch<{ calibrationCase: CalibrationCaseFull }>(`/api/v1/calibration/cases/${id}/retire`, {
    method: 'POST',
  })
}

export function getCalibrationStats() {
  return apiFetch<CalibrationStats>('/api/v1/calibration/stats')
}

// Operator
export function getNextCalibrationCase() {
  return apiFetch<{ calibrationCase: CalibrationCase | null }>('/api/v1/calibration/next')
}

export function submitCalibrationAttempt(data: {
  calibrationCaseId: string
  decision: OperatorDecision
  errTag?: ErrTag
  severity?: Severity
  correctedOutcome?: string
  notes?: string
  reviewTimeMs?: number
}) {
  return apiFetch<{ attempt: CalibrationAttempt; feedback: CalibrationFeedback }>(
    '/api/v1/calibration/attempt',
    { method: 'POST', body: data },
  )
}

export function getMyCalibration() {
  return apiFetch<{
    attempts: CalibrationAttempt[]
    totalAttempts: number
    passed: number
    failed: number
    avgScore: number | null
  }>('/api/v1/calibration/my')
}
