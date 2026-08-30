import type { ErrTag, OperatorDecision, Severity } from '@oreset/shared'
import { apiFetch } from '../client'

export type ConsensusPair = {
  id: string
  clientItemId: string
  reviewerOneId: string
  reviewerTwoId: string | null
  decisionOneId: string | null
  decisionTwoId: string | null
  status: 'awaiting_reviews' | 'agreed' | 'disagreed' | 'adjudicated'
  finalDecision: OperatorDecision | null
  finalErrTag: ErrTag | null
  finalSeverity: Severity | null
  agreementScore: number | null
  adjudicatorId: string | null
  adjudicatorNotes: string | null
  adjudicatedAt: string | null
  createdAt: string
  clientItem?: {
    id: string
    clientName: string
    externalRef: string
    content: string
    traceData: Record<string, unknown> | null
    status: string
  }
  decisionOne?: {
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
  } | null
  decisionTwo?: {
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
  } | null
}

export type ConsensusStats = {
  totalPairs: number
  completedPairs: number
  agreedCount: number
  disagreedCount: number
  adjudicatedCount: number
  pendingAdjudication: number
  rawAgreementRate: number | null
  avgAgreementScore: number | null
  cohensKappa: number | null
}

export function getConsensusStats() {
  return apiFetch<ConsensusStats>('/api/v1/consensus/stats')
}

export function getAdjudicationQueue() {
  return apiFetch<{ pairs: ConsensusPair[] }>('/api/v1/consensus/adjudication')
}

export function listConsensusPairs(status?: string) {
  const qs = status ? `?status=${status}` : ''
  return apiFetch<{ pairs: ConsensusPair[] }>(`/api/v1/consensus/pairs${qs}`)
}

export function adjudicatePair(
  pairId: string,
  data: {
    finalDecision: OperatorDecision
    finalErrTag?: ErrTag
    finalSeverity?: Severity
    notes?: string
  },
) {
  return apiFetch<{ pairId: string; status: string; finalDecision: string }>(
    `/api/v1/consensus/pairs/${pairId}/adjudicate`,
    { method: 'POST', body: data },
  )
}

export function enableDualSolve(itemId: string) {
  return apiFetch<{ item: unknown }>(`/api/v1/consensus/items/${itemId}/enable`, {
    method: 'POST',
  })
}

export function enableDualSolveBulk() {
  return apiFetch<{ count: number }>('/api/v1/consensus/enable-all', {
    method: 'POST',
  })
}
