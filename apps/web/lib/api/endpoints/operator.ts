import type { ErrTag, OperatorDecision, Severity, TicketStatus } from '@oreset/shared'
import { apiFetch } from '../client'

export type OperatorQueueItem = {
  id: string
  clientName: string
  externalRef: string
  content: string
  status: string
  createdAt: string
}

export type OperatorStats = {
  queueRemaining: number
  reviewedToday: number
  reviewedAllTime: number
  approvedAllTime: number
  escalatedAllTime: number
  rejectedAllTime: number
  approvalRate: number | null
  errTagBreakdown: Record<ErrTag, number>
  openTicketsFromMe: number
}

export type OperatorDecisionRecord = {
  id: string
  decision: OperatorDecision
  errTag: ErrTag | null
  severity: Severity | null
  notes: string | null
  createdAt: string
  clientItemId: string
  clientItemSnapshot: { content?: string; clientName?: string } | null
  ticket: { status: TicketStatus; resolvedAt: string | null } | null
}

export function getOperatorQueue() {
  return apiFetch<{ items: OperatorQueueItem[] }>('/api/v1/operator/queue')
}

export function submitOperatorDecision(
  itemId: string,
  input: { decision: OperatorDecision; errTag?: ErrTag; severity?: Severity; notes?: string },
) {
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

export type OperatorProfile = {
  user: {
    id: string
    displayName: string | null
    email: string | null
    status: string
    operatorCode: string | null
    createdAt: string
  }
  application: {
    location: string
    languages: OperatorLanguage[]
    dialect: string | null
    academicBackground: string
    englishProficiency: string
    availability: string[] | null
    experience: string | null
  } | null
  profileStrength: number
}

export type ProfileUpdateInput = {
  displayName?: string
  location?: string
  languages?: OperatorLanguage[]
  dialect?: string
  academicBackground?: string
  englishProficiency?: string
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
