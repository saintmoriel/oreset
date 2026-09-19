import type { VulnTag, ExploitStatus, OperatorDecision, Severity, TicketStatus } from '@oreset/shared'
import { apiFetch } from '../client'

export type ToolCall = {
  function: string
  args?: Record<string, unknown>
  authorized?: boolean
  result?: string
}

// Attack scenario payload. `input` is the attack prompt (string for new
// scenarios; legacy items may still carry the old structured object).
export type TraceData = {
  domain?: string
  scope?: string
  language?: string
  input?: string | { type?: string; [key: string]: unknown }
  aiDecision?: string
  aiOutcome?: string
  decisionCriteria?: string | null
  executionLogs?: Record<string, unknown>[]
  isDualSolve?: boolean
  isGoldStandard?: boolean
  targetEndpoint?: string
  attackType?: string
  toolCalls?: ToolCall[]
  systemPrompt?: string
  modelId?: string
  retestOf?: string
}

export type OperatorQueueItem = {
  id: string
  clientName: string
  externalRef: string
  content: string
  traceData: TraceData | null
  status: string
  createdAt: string
}

export type OperatorStats = {
  queueRemaining: number
  reviewedToday: number
  reviewedAllTime: number
  exploitedAllTime: number
  defendedAllTime: number
  escalatedAllTime: number
  inconclusiveAllTime: number
  exploitRate: number | null
  vulnTagBreakdown: Record<VulnTag, number>
  openTicketsFromMe: number
}

export type OperatorDecisionRecord = {
  id: string
  decision: OperatorDecision
  vulnTag: VulnTag | null
  severity: Severity | null
  exploitStatus: ExploitStatus | null
  reproductionSteps: string | null
  recommendedFix: string | null
  notes: string | null
  createdAt: string
  clientItemId: string
  clientItemSnapshot: { content?: string; clientName?: string } | null
  ticket: { status: TicketStatus; resolvedAt: string | null } | null
  // The lead auditor's verdict on this decision, when one has been recorded.
  verdict: {
    verdict: 'verified' | 'false_positive' | 'severity_adjusted'
    adjustedSeverity: Severity | null
    auditorNotes: string | null
    status: string
    verifiedAt: string
    closedAt: string | null
  } | null
}

export function getOperatorQueue() {
  return apiFetch<{ items: OperatorQueueItem[] }>('/api/v1/operator/queue')
}

export type DecisionInput = {
  decision: OperatorDecision
  vulnTag: VulnTag
  exploitStatus: ExploitStatus
  severity?: Severity
  notes?: string
  reproductionSteps?: string
  recommendedFix?: string
  reviewTimeMs?: number
}

export function submitOperatorDecision(itemId: string, input: DecisionInput) {
  return apiFetch<{ item: OperatorQueueItem }>(`/api/v1/operator/items/${itemId}/decision`, {
    method: 'POST',
    body: input,
  })
}

export function getMyOperatorStats() {
  return apiFetch<OperatorStats>('/api/v1/operator/me/stats')
}

export function getMyOperatorDecisions() {
  return apiFetch<{ decisions: OperatorDecisionRecord[] }>('/api/v1/operator/me/decisions')
}

export type OperatorLanguage = { language: string; fluency: string }

export type SecurityExperienceYears = 'none' | 'under_2' | '2_to_5' | 'over_5'

export type OperatorProfile = {
  user: {
    id: string
    displayName: string | null
    username: string | null
    avatarDataUrl: string | null
    email: string | null
    phone: string | null
    status: string
    operatorCode: string | null
    createdAt: string
  }
  application: {
    location: string
    languages: OperatorLanguage[]
    dialect: string | null
    securityExperienceYears: SecurityExperienceYears | null
    tools: string | null
    portfolioUrl: string | null
    availability: string[] | null
    experience: string | null
  } | null
  profileStrength: number
  missingRequired: { key: string; label: string }[]
  fields: { key: string; label: string; required: boolean; filled: boolean }[]
}

export type ProfileUpdateInput = {
  displayName?: string
  username?: string
  avatarDataUrl?: string | null
  phone?: string
  location?: string
  languages?: OperatorLanguage[]
  dialect?: string
  securityExperienceYears?: SecurityExperienceYears
  tools?: string
  portfolioUrl?: string
  availability?: string[]
  experience?: string
}

export function getOperatorProfile() {
  return apiFetch<OperatorProfile>('/api/v1/operator/me/profile')
}

export function updateOperatorProfile(data: ProfileUpdateInput) {
  return apiFetch<OperatorProfile>('/api/v1/operator/me/profile', {
    method: 'PATCH',
    body: data,
  })
}

export type DocumentType = 'government_id' | 'education_certificate' | 'resume' | 'other'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'
export type OverallVerificationStatus = 'incomplete' | 'pending' | 'verified' | 'rejected'

export type IdentityVerification = {
  id: string
  documentType: DocumentType
  fileName: string
  fileUrl: string
  fileSizeBytes: string | null
  status: VerificationStatus
  reviewNotes: string | null
  createdAt: string
  updatedAt: string
}

export type VerificationsResponse = {
  verifications: IdentityVerification[]
  overallStatus: OverallVerificationStatus
}

export function getVerifications() {
  return apiFetch<VerificationsResponse>('/api/v1/operator/me/verifications')
}

export function submitVerification(data: {
  documentType: DocumentType
  fileName: string
  fileUrl: string
  fileSizeBytes?: string
}) {
  return apiFetch<IdentityVerification>('/api/v1/operator/me/verifications', {
    method: 'POST',
    body: data,
  })
}

export type PayoutDetails = {
  country: string
  bankName: string
  accountNumber: string
  accountName: string
} | null

export type PayoutDetailsResponse = {
  payoutDetails: PayoutDetails
  identityVerified: boolean
}

export function getPayoutDetails() {
  return apiFetch<PayoutDetailsResponse>('/api/v1/operator/me/payout-details')
}

export function updatePayoutDetails(data: {
  country: string
  bankName: string
  accountNumber: string
  accountName: string
}) {
  return apiFetch<PayoutDetailsResponse>('/api/v1/operator/me/payout-details', {
    method: 'PATCH',
    body: data,
  })
}

export type AgreementType = 'tester_agreement' | 'nda' | 'code_of_conduct' | 'data_handling' | 'identity_account'

export type OperatorAgreement = {
  id: string
  agreementType: AgreementType
  version: string
  signedAt: string
  ipAddress: string | null
  textHash: string | null
  userAgent: string | null
}

export type RequiredAgreement = {
  type: AgreementType
  label: string
  version: string
  summary: string
  text: string
  signed: boolean
  signedAt: string | null
  outdated: boolean
  previousVersion: string | null
}

export type AgreementsResponse = {
  agreements: OperatorAgreement[]
  required: RequiredAgreement[]
  complete: boolean
}

export function getAgreements() {
  return apiFetch<AgreementsResponse>('/api/v1/operator/me/agreements')
}

export function signAgreement(agreementType: AgreementType) {
  return apiFetch<OperatorAgreement>('/api/v1/operator/me/agreements', {
    method: 'POST',
    body: { agreementType },
  })
}
