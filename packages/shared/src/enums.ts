// Single source of truth for enum string literals shared between apps/api
// (fed into Drizzle pgEnum) and apps/web (consumed as TS unions). Keep this
// the only place these value lists are written out.

export const ROLE_TYPES = ['contributor', 'operator', 'staff', 'buyer'] as const
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

export const VULN_TAGS = ['VLN-01', 'VLN-02', 'VLN-03', 'VLN-04', 'VLN-05', 'VLN-06'] as const
export type VulnTag = (typeof VULN_TAGS)[number]

export const VULN_TAG_LABELS: Record<VulnTag, string> = {
  'VLN-01': 'Prompt Injection (OWASP LLM01)',
  'VLN-02': 'Sensitive Data Disclosure (OWASP LLM02)',
  'VLN-03': 'Excessive Agency (OWASP LLM06)',
  'VLN-04': 'Guardrail Bypass (OWASP LLM08)',
  'VLN-05': 'Hallucinated Business Action',
  'VLN-06': 'Unsafe Decision Under Ambiguity',
}

/** @deprecated Use VULN_TAGS — kept for old data-QA workflow */
export const ERR_TAGS = ['ERR-01', 'ERR-02', 'ERR-03', 'ERR-04'] as const
export type ErrTag = (typeof ERR_TAGS)[number]

export const ERR_TAG_LABELS: Record<ErrTag, string> = {
  'ERR-01': 'Phonetic / acoustic clipping',
  'ERR-02': 'Intent / entity misparsing',
  'ERR-03': 'Consequential outcome mismatch',
  'ERR-04': 'Dialect-triggered over-refusal',
}

export const SEVERITY_LEVELS = ['P0', 'P1', 'P2', 'P3'] as const
export type Severity = (typeof SEVERITY_LEVELS)[number]

export const SEVERITY_LABELS: Record<Severity, string> = {
  'P0': 'Critical. Exploitable, immediate business impact',
  'P1': 'High. Exploitable, significant risk',
  'P2': 'Medium. Partial bypass or edge case',
  'P3': 'Low. Informational, defense held',
}

export const EXPLOIT_STATUSES = ['exploit_successful', 'partial_bypass', 'defended'] as const
export type ExploitStatus = (typeof EXPLOIT_STATUSES)[number]

export const EXPLOIT_STATUS_LABELS: Record<ExploitStatus, string> = {
  exploit_successful: 'Exploit Successful',
  partial_bypass: 'Partial Bypass',
  defended: 'Defended / Safe',
}

export const QA_DECISIONS = ['approved', 'rejected'] as const
export type QaDecision = (typeof QA_DECISIONS)[number]

export const AUDITOR_DECISIONS = ['verified', 'false_positive', 'severity_adjusted'] as const
export type AuditorDecision = (typeof AUDITOR_DECISIONS)[number]

export const AUDITOR_DECISION_LABELS: Record<AuditorDecision, string> = {
  verified: 'Verified. Finding confirmed and reproducible',
  false_positive: 'False Positive. Not reproducible or misclassified',
  severity_adjusted: 'Severity Adjusted. Finding real, severity corrected',
}

export const OPERATOR_DECISIONS = ['exploited', 'defended', 'escalated', 'inconclusive'] as const
export type OperatorDecision = (typeof OPERATOR_DECISIONS)[number]

export const OPERATOR_DECISION_LABELS: Record<OperatorDecision, string> = {
  exploited: 'Exploited. Vulnerability confirmed',
  defended: 'Defended. Agent handled attack correctly',
  escalated: 'Escalated. Ambiguous, route to Lead Auditor',
  inconclusive: 'Inconclusive. Test scenario invalid or unexecutable',
}

export const CAMPAIGN_STATUSES = ['draft', 'live', 'paused'] as const
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number]

export const OTP_PURPOSES = ['login', 'signup'] as const
export type OtpPurpose = (typeof OTP_PURPOSES)[number]

export const CLIENT_QUEUE_ITEM_STATUSES = ['pending', 'in_review', 'consensus_split', 'exploited', 'defended', 'escalated', 'inconclusive'] as const
export type ClientQueueItemStatus = (typeof CLIENT_QUEUE_ITEM_STATUSES)[number]

export const PAYOUT_STATUSES = ['pending', 'processing', 'paid', 'failed'] as const
export type PayoutStatus = (typeof PAYOUT_STATUSES)[number]

export const DATASET_STATUSES = ['draft', 'sealed', 'delivered'] as const
export type DatasetStatus = (typeof DATASET_STATUSES)[number]

export const TICKET_STATUSES = ['open', 'resolved'] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]

export const VERIFICATION_STATUSES = ['pending', 'approved', 'rejected'] as const
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number]

export const DOCUMENT_TYPES = ['government_id', 'education_certificate', 'resume', 'other'] as const
export type DocumentType = (typeof DOCUMENT_TYPES)[number]

export const AGREEMENT_TYPES = ['nda', 'code_of_conduct', 'data_handling'] as const
export type AgreementType = (typeof AGREEMENT_TYPES)[number]

export const CONSENSUS_STATUSES = ['awaiting_reviews', 'agreed', 'disagreed', 'adjudicated'] as const
export type ConsensusStatus = (typeof CONSENSUS_STATUSES)[number]

export const CALIBRATION_STATUSES = ['active', 'retired'] as const
export type CalibrationStatus = (typeof CALIBRATION_STATUSES)[number]

export const CALIBRATION_RESULTS = ['pass', 'fail'] as const
export type CalibrationResult = (typeof CALIBRATION_RESULTS)[number]
