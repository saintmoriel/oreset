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
import { prompts } from './prompts'
import { operatorApplications } from './operator-applications'
import { payouts } from './payouts'
import { datasets } from './datasets'
import { datasetItems } from './dataset-items'
import { datasetDownloadEvents } from './dataset-download-events'
import { clientTickets } from './client-tickets'
import { identityVerifications } from './identity-verifications'
import { operatorAgreements } from './operator-agreements'
import { calibrationCases, calibrationAttempts } from './calibration'

export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  consentRecords: many(consentRecords),
  submissions: many(submissions),
  qaReviewDecisions: many(qaReviewDecisions),
  operatorReviewDecisions: many(operatorReviewDecisions),
  operatorApplication: one(operatorApplications, {
    fields: [users.id],
    references: [operatorApplications.userId],
  }),
  payouts: many(payouts),
  // Buyer-facing: datasets handed off to this user.
  boughtDatasets: many(datasets, { relationName: 'datasetBuyer' }),
  createdDatasets: many(datasets, { relationName: 'datasetCreator' }),
  resolvedTickets: many(clientTickets),
  datasetDownloadEvents: many(datasetDownloadEvents),
  identityVerifications: many(identityVerifications),
  operatorAgreements: many(operatorAgreements),
}))

export const datasetsRelations = relations(datasets, ({ one, many }) => ({
  campaign: one(campaigns, { fields: [datasets.campaignId], references: [campaigns.id] }),
  buyer: one(users, { fields: [datasets.buyerId], references: [users.id], relationName: 'datasetBuyer' }),
  createdByUser: one(users, {
    fields: [datasets.createdBy],
    references: [users.id],
    relationName: 'datasetCreator',
  }),
  items: many(datasetItems),
  downloadEvents: many(datasetDownloadEvents),
}))

export const datasetItemsRelations = relations(datasetItems, ({ one }) => ({
  dataset: one(datasets, { fields: [datasetItems.datasetId], references: [datasets.id] }),
  submission: one(submissions, { fields: [datasetItems.submissionId], references: [submissions.id] }),
}))

export const datasetDownloadEventsRelations = relations(datasetDownloadEvents, ({ one }) => ({
  dataset: one(datasets, { fields: [datasetDownloadEvents.datasetId], references: [datasets.id] }),
  submission: one(submissions, {
    fields: [datasetDownloadEvents.submissionId],
    references: [submissions.id],
  }),
  buyer: one(users, { fields: [datasetDownloadEvents.buyerId], references: [users.id] }),
}))

export const clientTicketsRelations = relations(clientTickets, ({ one }) => ({
  operatorReviewDecision: one(operatorReviewDecisions, {
    fields: [clientTickets.operatorReviewDecisionId],
    references: [operatorReviewDecisions.id],
  }),
  resolvedByUser: one(users, { fields: [clientTickets.resolvedBy], references: [users.id] }),
}))

export const payoutsRelations = relations(payouts, ({ one, many }) => ({
  contributor: one(users, { fields: [payouts.contributorId], references: [users.id] }),
  submissions: many(submissions),
}))

export const operatorApplicationsRelations = relations(operatorApplications, ({ one }) => ({
  user: one(users, { fields: [operatorApplications.userId], references: [users.id] }),
}))

export const identityVerificationsRelations = relations(identityVerifications, ({ one }) => ({
  user: one(users, { fields: [identityVerifications.userId], references: [users.id] }),
  reviewer: one(users, { fields: [identityVerifications.reviewedBy], references: [users.id] }),
}))

export const operatorAgreementsRelations = relations(operatorAgreements, ({ one }) => ({
  user: one(users, { fields: [operatorAgreements.userId], references: [users.id] }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const campaignsRelations = relations(campaigns, ({ many, one }) => ({
  batches: many(batches),
  operatorReviewDecisions: many(operatorReviewDecisions),
  createdByUser: one(users, { fields: [campaigns.createdBy], references: [users.id] }),
  datasets: many(datasets),
}))

export const batchesRelations = relations(batches, ({ one, many }) => ({
  campaign: one(campaigns, { fields: [batches.campaignId], references: [campaigns.id] }),
  submissions: many(submissions),
  consentRecords: many(consentRecords),
  prompts: many(prompts),
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
  payout: one(payouts, { fields: [submissions.payoutId], references: [payouts.id] }),
  datasetItem: one(datasetItems, { fields: [submissions.id], references: [datasetItems.submissionId] }),
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
  ticket: one(clientTickets, {
    fields: [operatorReviewDecisions.id],
    references: [clientTickets.operatorReviewDecisionId],
  }),
}))

export const promptsRelations = relations(prompts, ({ one }) => ({
  batch: one(batches, { fields: [prompts.batchId], references: [batches.id] }),
}))

export const calibrationCasesRelations = relations(calibrationCases, ({ one, many }) => ({
  createdByUser: one(users, { fields: [calibrationCases.createdBy], references: [users.id] }),
  attempts: many(calibrationAttempts),
}))

export const calibrationAttemptsRelations = relations(calibrationAttempts, ({ one }) => ({
  calibrationCase: one(calibrationCases, {
    fields: [calibrationAttempts.calibrationCaseId],
    references: [calibrationCases.id],
  }),
  operator: one(users, { fields: [calibrationAttempts.operatorId], references: [users.id] }),
}))
