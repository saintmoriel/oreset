import { pgEnum } from 'drizzle-orm/pg-core'
import {
  ROLE_TYPES,
  STAFF_ROLES,
  USER_STATUSES,
  MEDIA_TYPES,
  BATCH_STATUSES,
  SUBMISSION_STATUSES,
  VALIDATION_OUTCOMES,
  ERR_TAGS,
  SEVERITY_LEVELS,
  QA_DECISIONS,
  OPERATOR_DECISIONS,
  CAMPAIGN_STATUSES,
  OTP_PURPOSES,
} from '@oreset/shared'

// Fed directly from packages/shared/src/enums.ts so the DB layer and the
// TS types consumed by apps/web can never drift apart.
export const roleTypeEnum = pgEnum('role_type', ROLE_TYPES)
export const staffRoleEnum = pgEnum('staff_role', STAFF_ROLES)
export const userStatusEnum = pgEnum('user_status', USER_STATUSES)
export const mediaTypeEnum = pgEnum('media_type', MEDIA_TYPES)
export const batchStatusEnum = pgEnum('batch_status', BATCH_STATUSES)
export const submissionStatusEnum = pgEnum('submission_status', SUBMISSION_STATUSES)
export const validationOutcomeEnum = pgEnum('validation_outcome', VALIDATION_OUTCOMES)
export const errTagEnum = pgEnum('err_tag', ERR_TAGS)
export const severityEnum = pgEnum('severity', SEVERITY_LEVELS)
export const qaDecisionEnum = pgEnum('qa_decision', QA_DECISIONS)
export const operatorDecisionEnum = pgEnum('operator_decision', OPERATOR_DECISIONS)
export const campaignStatusEnum = pgEnum('campaign_status', CAMPAIGN_STATUSES)
export const otpPurposeEnum = pgEnum('otp_purpose', OTP_PURPOSES)
