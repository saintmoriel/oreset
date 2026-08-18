import { relations } from 'drizzle-orm'
import { users } from './users'
import { sessions } from './sessions'
import { consentRecords } from './consent-records'
import { campaigns } from './campaigns'
import { batches } from './batches'
import { submissions } from './submissions'
import { validationResults } from './validation-results'
import { qaReviewDecisions } from './qa-review-decisions'
import { operatorReviewDecisions } from './operator-review-decisions'

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  consentRecords: many(consentRecords),
  submissions: many(submissions),
  qaReviewDecisions: many(qaReviewDecisions),
  operatorReviewDecisions: many(operatorReviewDecisions),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const campaignsRelations = relations(campaigns, ({ many, one }) => ({
  batches: many(batches),
  operatorReviewDecisions: many(operatorReviewDecisions),
  createdByUser: one(users, { fields: [campaigns.createdBy], references: [users.id] }),
}))

export const batchesRelations = relations(batches, ({ one, many }) => ({
  campaign: one(campaigns, { fields: [batches.campaignId], references: [campaigns.id] }),
  submissions: many(submissions),
  consentRecords: many(consentRecords),
}))

export const consentRecordsRelations = relations(consentRecords, ({ one }) => ({
  contributor: one(users, { fields: [consentRecords.contributorId], references: [users.id] }),
  batch: one(batches, { fields: [consentRecords.batchId], references: [batches.id] }),
}))

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  batch: one(batches, { fields: [submissions.batchId], references: [batches.id] }),
  contributor: one(users, { fields: [submissions.contributorId], references: [users.id] }),
  consentRecord: one(consentRecords, {
    fields: [submissions.consentRecordId],
    references: [consentRecords.id],
  }),
  validationResults: many(validationResults),
  qaReviewDecisions: many(qaReviewDecisions),
}))

export const validationResultsRelations = relations(validationResults, ({ one }) => ({
  submission: one(submissions, {
    fields: [validationResults.submissionId],
    references: [submissions.id],
  }),
}))

export const qaReviewDecisionsRelations = relations(qaReviewDecisions, ({ one }) => ({
  submission: one(submissions, {
    fields: [qaReviewDecisions.submissionId],
    references: [submissions.id],
  }),
  reviewer: one(users, { fields: [qaReviewDecisions.reviewerId], references: [users.id] }),
}))

export const operatorReviewDecisionsRelations = relations(operatorReviewDecisions, ({ one }) => ({
  operator: one(users, { fields: [operatorReviewDecisions.operatorId], references: [users.id] }),
  campaign: one(campaigns, {
    fields: [operatorReviewDecisions.campaignId],
    references: [campaigns.id],
  }),
}))
