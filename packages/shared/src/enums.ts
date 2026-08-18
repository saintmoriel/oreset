// Single source of truth for enum string literals shared between apps/api
// (fed into Drizzle pgEnum) and apps/web (consumed as TS unions). Keep this
// the only place these value lists are written out.

export const ROLE_TYPES = ['contributor', 'operator', 'staff'] as const
export type RoleType = (typeof ROLE_TYPES)[number]

export const STAFF_ROLES = ['qa_reviewer', 'admin', 'compliance', 'reviewer_lead'] as const
export type StaffRole = (typeof STAFF_ROLES)[number]

export const USER_STATUSES = ['active', 'suspended', 'pending'] as const
export type UserStatus = (typeof USER_STATUSES)[number]

export const MEDIA_TYPES = ['audio', 'image'] as const
export type MediaType = (typeof MEDIA_TYPES)[number]

export const BATCH_STATUSES = ['available', 'under_review', 'approved', 'paid', 'rejected'] as const
export type BatchStatus = (typeof BATCH_STATUSES)[number]

export const SUBMISSION_STATUSES = ['submitted', 'validated', 'qa_approved', 'qa_rejected'] as const
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number]

export const VALIDATION_OUTCOMES = ['pass', 'fail'] as const
export type ValidationOutcome = (typeof VALIDATION_OUTCOMES)[number]

export const ERR_TAGS = ['ERR-01', 'ERR-02', 'ERR-03', 'ERR-04'] as const
export type ErrTag = (typeof ERR_TAGS)[number]

export const ERR_TAG_LABELS: Record<ErrTag, string> = {
  'ERR-01': 'Acoustic / environmental noise',
  'ERR-02': 'Linguistic mismatch',
  'ERR-03': 'Truncation / trailing-off',
  'ERR-04': 'Compliance / metadata anomaly',
}

export const SEVERITY_LEVELS = ['SEV-1', 'SEV-2', 'SEV-3'] as const
export type Severity = (typeof SEVERITY_LEVELS)[number]

export const QA_DECISIONS = ['approved', 'rejected'] as const
export type QaDecision = (typeof QA_DECISIONS)[number]

export const OPERATOR_DECISIONS = ['approved', 'escalated', 'rejected'] as const
export type OperatorDecision = (typeof OPERATOR_DECISIONS)[number]

export const CAMPAIGN_STATUSES = ['draft', 'live', 'paused'] as const
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number]

export const OTP_PURPOSES = ['login', 'signup'] as const
export type OtpPurpose = (typeof OTP_PURPOSES)[number]
