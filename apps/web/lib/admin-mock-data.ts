export const ORIGIN_STAGES = [
  { name: 'Intake', count: 128 },
  { name: 'Task Forge', count: 96 },
  { name: 'Field Pool', count: 240 },
  { name: 'Capture', count: 412 },
  { name: 'Automated Validation', count: 88 },
  { name: 'Review Bench', count: 4 },
  { name: 'Payout Line', count: 63 },
  { name: 'Assembly', count: 55 },
  { name: 'Provenance Seal', count: 55 },
  { name: 'Handoff', count: 40 },
] as const

export const OPERATOR_STAGES = [
  { name: 'Scout', count: 34 },
  { name: 'Foundry', count: 19 },
  { name: 'Certify', count: 12 },
  { name: 'Bench', count: 27 },
  { name: 'Match', count: 21 },
  { name: 'Oversight', count: 8 },
] as const

export const AUDIT_LOG = [
  { time: '2026-08-18 09:12', actor: 'sess_8f2a3c', role: 'Contributor', action: 'consent.recorded', resource: 'session/8f2a3c' },
  { time: '2026-08-18 09:13', actor: 'validation-svc', role: 'System', action: 'submission.validation.passed', resource: 'session/8f2a3c' },
  { time: '2026-08-18 09:14', actor: 'sess_c4a012', role: 'Contributor', action: 'consent.recorded', resource: 'session/c4a012' },
  { time: '2026-08-18 09:15', actor: 'validation-svc', role: 'System', action: 'submission.validation.flagged.ERR-02', resource: 'session/c4a012' },
  { time: '2026-08-18 09:41', actor: 'staff-lead-02', role: 'Origin QA', action: 'qa.approved', resource: 'session/8f2a3c' },
  { time: '2026-08-18 10:02', actor: 'OP-4471', role: 'Certified Operator', action: 'operator.escalated.ERR-02.SEV-2', resource: 'txn/5521c' },
  { time: '2026-08-18 10:30', actor: 'admin-01', role: 'Admin', action: 'rbac.role_changed', resource: 'operator/OP-4471' },
  { time: '2026-08-18 11:05', actor: 'foundry-lms', role: 'System', action: 'operator.certified', resource: 'operator/OP-5820' },
] as const

export const CAMPAIGN_LANGUAGES = ['Yorùbá', 'Hausa', 'Igbo', 'Somali', 'Lingala', 'Swahili']
export const CAMPAIGN_DOMAINS = ['Read-speech', 'Conversational speech', 'Crop / agri imagery', 'Document imagery']
export const CAMPAIGN_MEDIA_TYPES = ['Audio', 'Image'] as const
export const CAMPAIGN_COHORTS = [
  'Yorùbá Native Cohort',
  'Hausa Native Cohort',
  'Somali Native Cohort',
  'Crop Imagery Field Agents — Kaduna',
]
