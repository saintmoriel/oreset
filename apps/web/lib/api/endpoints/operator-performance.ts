import type { VulnTag } from '@oreset/shared'
import { apiFetch } from '../client'

export type OperatorPerformanceEntry = {
  id: string
  displayName: string | null
  operatorCode: string | null
  status: string
  languages: string[]
  location: string | null
  joinedAt: string
  totalReviews: number
  reviewsToday: number
  reviews7d: number
  reviews30d: number
  decisionBreakdown: {
    exploited: number
    defended: number
    escalated: number
    inconclusive: number
  }
  exploitRate: number | null
  vulnTagBreakdown: Record<VulnTag, number>
  avgReviewTimeMs: number | null
  medianReviewTimeMs: number | null
  calibrationAttempts: number
  calibrationPassed: number
  calibrationPassRate: number | null
  calibrationAvgScore: number | null
  consensusTotal: number
  consensusAgreed: number
  consensusAgreementRate: number | null
}

export type OperatorPerformanceGlobalStats = {
  totalOperators: number
  activeOperators: number
  totalReviews: number
  avgReviewsPerOperator: number
  totalCalibrationAttempts: number
  totalConsensusPairs: number
}

export type OperatorPerformanceResponse = {
  operators: OperatorPerformanceEntry[]
  globalStats: OperatorPerformanceGlobalStats
}

export function getOperatorPerformance() {
  return apiFetch<OperatorPerformanceResponse>('/api/v1/admin/operators/performance')
}
