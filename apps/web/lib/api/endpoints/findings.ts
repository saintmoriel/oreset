import type {
  AuditorDecision,
  ExploitStatus,
  FindingStatus,
  OperatorDecision,
  Severity,
  VulnTag,
} from '@oreset/shared'
import { apiFetch } from '../client'

// ---------------------------------------------------------------------------
// Lead auditor (staff: admin, reviewer_lead)
// ---------------------------------------------------------------------------

export type FindingDecision = {
  id: string
  operatorId: string
  clientItemId: string // externalRef
  clientItemSnapshot: {
    content?: string
    clientName?: string
    traceData?: Record<string, unknown> | null
  } | null
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

export type FindingOperator = {
  id: string
  displayName: string | null
  operatorCode: string | null
}

export type VerifiedFinding = {
  id: string
  clientItemId: string
  reviewDecisionId: string
  auditorId: string
  verdict: AuditorDecision
  adjustedSeverity: Severity | null
  reproducible: boolean
  blastRadius: string | null
  auditorNotes: string | null
  status: FindingStatus
  fixSubmittedAt: string | null
  retestedAt: string | null
  retestedBy: string | null
  retestNotes: string | null
  closedAt: string | null
  verifiedAt: string
  createdAt: string
}

export type VerificationQueueEntry = {
  decision: FindingDecision
  operator: FindingOperator | null
  item: {
    id: string
    externalRef: string
    status: string
    submittedBy: string | null
    requiresDualSolve: boolean
  } | null
}

export type FindingDetail = {
  decision: FindingDecision
  item: {
    id: string
    clientName: string
    externalRef: string
    content: string
    traceData: Record<string, unknown> | null
    status: string
  } | null
  verification: VerifiedFinding | null
  operator: FindingOperator | null
}

export type VerificationStats = {
  pendingVerification: number
  totalVerified: number
  byVerdict: Record<AuditorDecision, number>
  byStatus: Partial<Record<FindingStatus, number>>
  falsePositiveRate: number | null
}

export type VerifyInput = {
  verdict: AuditorDecision
  adjustedSeverity?: Severity
  reproducible: boolean
  blastRadius?: string
  auditorNotes?: string
}

export function getVerificationQueue() {
  return apiFetch<{ findings: VerificationQueueEntry[] }>('/api/v1/findings/queue')
}

export function getVerificationStats() {
  return apiFetch<VerificationStats>('/api/v1/findings/stats')
}

export function getFindingDetail(decisionId: string) {
  return apiFetch<FindingDetail>(`/api/v1/findings/${decisionId}`)
}

export function verifyFinding(decisionId: string, input: VerifyInput) {
  return apiFetch<{ finding: VerifiedFinding }>(`/api/v1/findings/${decisionId}/verify`, {
    method: 'POST',
    body: input,
  })
}

// ---------------------------------------------------------------------------
// Client (buyer)
// ---------------------------------------------------------------------------

export type ClientFinding = {
  id: string | null
  decisionId: string
  itemId: string
  externalRef: string
  clientName: string
  domain: string | null
  attackType: string | null
  targetEndpoint: string | null
  vulnTag: VulnTag | null
  severity: Severity | null
  exploitStatus: ExploitStatus | null
  reproductionSteps: string | null
  recommendedFix: string | null
  testerNotes: string | null
  blastRadius: string | null
  reproducible: boolean | null
  verdict: AuditorDecision | 'pending'
  status: FindingStatus
  foundAt: string
  verifiedAt: string | null
  fixSubmittedAt: string | null
  retestedAt: string | null
  closedAt: string | null
}

export type ClientFindingsResponse = {
  score: number
  label: string
  breakdown: {
    byVulnTag: Record<string, number>
    bySeverity: Record<string, number>
  }
  counts: {
    open: number
    closed: number
    pendingVerification: number
    falsePositive: number
    fixSubmitted: number
  }
  findings: ClientFinding[]
}

export function getMyFindings() {
  return apiFetch<ClientFindingsResponse>('/api/v1/buyer/findings')
}

export function markFindingFixed(findingId: string) {
  return apiFetch<{ finding: VerifiedFinding; retestItem: { id: string } }>(
    `/api/v1/buyer/findings/${findingId}/fixed`,
    { method: 'POST' },
  )
}
