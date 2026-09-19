// Single source of truth for enum string literals shared between apps/api
// (fed into Drizzle pgEnum) and apps/web (consumed as TS unions). Keep this
// the only place these value lists are written out.

export const ROLE_TYPES = ['contributor', 'operator', 'staff', 'buyer'] as const
export type RoleType = (typeof ROLE_TYPES)[number]

export const STAFF_ROLES = ['qa_reviewer', 'admin', 'compliance', 'reviewer_lead', 'engineer', 'sales'] as const
export type StaffRole = (typeof STAFF_ROLES)[number]

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  admin: 'Owner',
  reviewer_lead: 'Lead auditor',
  compliance: 'Compliance',
  engineer: 'Engineer',
  sales: 'Sales and marketing',
  qa_reviewer: 'QA reviewer (legacy)',
}

// Modules of the staff console. A role is a default bundle of modules; a
// person can be granted extra modules (with a reason, optionally expiring)
// through an approved access request. Home is always visible to staff.
export const ADMIN_MODULES = [
  'leads',
  'findings',
  'escalations',
  'consensus',
  'calibration',
  'regressions',
  'testers',
  'clients',
  'people',
  'payouts',
  'audit',
] as const
export type AdminModule = (typeof ADMIN_MODULES)[number]

export const ADMIN_MODULE_LABELS: Record<AdminModule, string> = {
  leads: 'Leads',
  findings: 'Findings verification',
  escalations: 'Escalations',
  consensus: 'Consensus adjudication',
  calibration: 'Calibration cases',
  regressions: 'Regression exports',
  testers: 'Testers and applications',
  clients: 'Clients',
  people: 'People and access',
  payouts: 'Payouts',
  audit: 'Audit log',
}

export const ADMIN_MODULE_DESCRIPTIONS: Record<AdminModule, string> = {
  leads: 'Early access requests and contact form messages. Who wants to talk to us.',
  findings: 'Verify, reject or re-grade tester findings before clients see them.',
  escalations: 'Tickets testers raised on scenarios that need a lead decision.',
  consensus: 'Split assessments between testers waiting for adjudication.',
  calibration: 'Known-answer scenarios testers must pass. Create and retire them.',
  regressions: 'Export closed and open findings as regression suites.',
  testers: 'Tester applications, approvals, performance and tiers.',
  clients: 'Client accounts, engagements and resilience scores.',
  people: 'Every account, its role and access. Create staff, suspend, reset passwords, approve access requests.',
  payouts: 'Tester payout batches and history.',
  audit: 'Every security-relevant action, who did it and when.',
}

export const ROLE_DEFAULT_MODULES: Record<StaffRole, readonly AdminModule[]> = {
  admin: ADMIN_MODULES,
  reviewer_lead: ['findings', 'escalations', 'consensus', 'calibration', 'regressions', 'testers'],
  compliance: ['audit'],
  engineer: [],
  sales: ['leads', 'clients'],
  qa_reviewer: [],
}

// An engagement is one scoped piece of work for one client. Scenarios
// belong to an engagement; testers acknowledge its Rules of Engagement
// before their first decision on it; the client sees its phase.
export const ENGAGEMENT_TIERS = ['rapid', 'comprehensive', 'continuous'] as const
export type EngagementTier = (typeof ENGAGEMENT_TIERS)[number]

export const ENGAGEMENT_TIER_LABELS: Record<EngagementTier, string> = {
  rapid: 'Rapid Agent Pentest',
  comprehensive: 'Comprehensive Red Team',
  continuous: 'Continuous',
}

export const ENGAGEMENT_PHASES = ['kickoff', 'testing', 'readout', 'retest', 'closed'] as const
export type EngagementPhase = (typeof ENGAGEMENT_PHASES)[number]

export const ENGAGEMENT_PHASE_LABELS: Record<EngagementPhase, string> = {
  kickoff: 'Kickoff',
  testing: 'Testing',
  readout: 'Readout',
  retest: 'Retest',
  closed: 'Closed',
}

export const ENGAGEMENT_PHASE_DESCRIPTIONS: Record<EngagementPhase, string> = {
  kickoff: 'Scope agreed, access being set up, scenarios being written. Nothing to act on yet.',
  testing: 'The red team is working scenarios. Verified findings appear here as they land.',
  readout: 'Testing has finished. Review every finding, ask questions, plan fixes.',
  retest: 'Mark fixes as submitted and we re-run the original attacks for free.',
  closed: 'This engagement is complete. Findings and exports stay available.',
}

// Phases in which testers may be assigned scenarios.
export const ENGAGEMENT_LIVE_PHASES: readonly EngagementPhase[] = ['kickoff', 'testing', 'retest']

export const ACCESS_REQUEST_STATUSES = ['pending', 'approved', 'denied'] as const
export type AccessRequestStatus = (typeof ACCESS_REQUEST_STATUSES)[number]

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

// Lifecycle of a verified finding. Free retest is part of every engagement:
// the client marks a fix, a tester re-runs the scenario, and the finding
// closes only when the attack no longer lands.
export const FINDING_STATUSES = [
  'discovered',
  'verified',
  'fix_submitted',
  'retesting',
  'closed',
  'reopened',
  'false_positive',
] as const
export type FindingStatus = (typeof FINDING_STATUSES)[number]

export const FINDING_STATUS_LABELS: Record<FindingStatus, string> = {
  discovered: 'Discovered. Awaiting auditor verification',
  verified: 'Verified. Open, awaiting your fix',
  fix_submitted: 'Fix submitted. Retest queued',
  retesting: 'Retesting. A tester is re-running the scenario',
  closed: 'Closed. Fix confirmed, attack no longer lands',
  reopened: 'Reopened. Fix did not hold',
  false_positive: 'False positive. Not a real finding',
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
