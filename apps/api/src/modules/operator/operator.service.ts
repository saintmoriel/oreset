import { and, asc, count, desc, eq, sql } from 'drizzle-orm'
import type { AgreementType, ErrTag, OperatorDecision, RoleType, Severity } from '@oreset/shared'
import { ERR_TAGS } from '@oreset/shared'
import { db } from '../../db/client'
import { clientQueueItems, operatorReviewDecisions, clientTickets, users, operatorApplications, identityVerifications, operatorAgreements } from '../../db/schema'
import { writeAuditLog } from '../../lib/audit'
import { HttpError } from '../../middleware/error-handler'

export async function getQueue(operatorId?: string) {
  if (!operatorId) {
    return db.query.clientQueueItems.findMany({
      where: eq(clientQueueItems.status, 'pending'),
      orderBy: asc(clientQueueItems.createdAt),
    })
  }

  // Look up the operator's language profile
  const application = await db.query.operatorApplications.findFirst({
    where: eq(operatorApplications.userId, operatorId),
  })

  const operatorLanguages = Array.isArray(application?.languages)
    ? (application.languages as { language: string }[]).map((l) => l.language.toLowerCase())
    : []

  if (operatorLanguages.length === 0) {
    // No language profile — return all pending items, oldest first
    return db.query.clientQueueItems.findMany({
      where: eq(clientQueueItems.status, 'pending'),
      orderBy: asc(clientQueueItems.createdAt),
    })
  }

  // Return all pending items, language-matched first, then by creation date
  const items = await db
    .select()
    .from(clientQueueItems)
    .where(eq(clientQueueItems.status, 'pending'))
    .orderBy(
      sql`CASE WHEN lower(trace_data->>'language') = ANY(${operatorLanguages}) THEN 0 ELSE 1 END`,
      asc(clientQueueItems.createdAt),
    )

  return items
}

// Real COUNT — cheaper than getQueue().length, no per-row cost to throw away.
export async function getQueueCount(): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(clientQueueItems)
    .where(eq(clientQueueItems.status, 'pending'))
  return row?.value ?? 0
}

export async function getMyDecisions(operatorId: string) {
  return db.query.operatorReviewDecisions.findMany({
    where: eq(operatorReviewDecisions.operatorId, operatorId),
    orderBy: desc(operatorReviewDecisions.createdAt),
    limit: 50,
    with: { ticket: true },
  })
}

export async function getMyStats(operatorId: string) {
  const decisions = await db.query.operatorReviewDecisions.findMany({
    where: eq(operatorReviewDecisions.operatorId, operatorId),
    with: { ticket: true },
  })

  const today = new Date().toISOString().slice(0, 10)
  const reviewedToday = decisions.filter((d) => d.createdAt.toISOString().slice(0, 10) === today).length
  const approvedAllTime = decisions.filter((d) => d.decision === 'approved').length
  const correctedAllTime = decisions.filter((d) => d.decision === 'corrected').length
  const rejectedAllTime = decisions.filter((d) => d.decision === 'rejected').length
  const escalatedAllTime = decisions.filter((d) => d.decision === 'escalated').length
  const declinedAllTime = decisions.filter((d) => d.decision === 'declined').length
  const reviewedAllTime = decisions.length
  const approvalRate = reviewedAllTime > 0 ? Math.round((approvedAllTime / reviewedAllTime) * 100) : null

  const errTagBreakdown = Object.fromEntries(ERR_TAGS.map((tag) => [tag, 0])) as Record<ErrTag, number>
  for (const d of decisions) {
    if (d.errTag) errTagBreakdown[d.errTag] += 1
  }

  const openTicketsFromMe = decisions.filter((d) => d.ticket && d.ticket.status === 'open').length

  return {
    queueRemaining: await getQueueCount(),
    reviewedToday,
    reviewedAllTime,
    approvedAllTime,
    correctedAllTime,
    rejectedAllTime,
    escalatedAllTime,
    declinedAllTime,
    approvalRate,
    errTagBreakdown,
    openTicketsFromMe,
  }
}

export async function decide(input: {
  itemId: string
  operatorId: string
  operatorRole: RoleType
  decision: OperatorDecision
  errTag?: ErrTag
  severity?: Severity
  notes?: string
  correctedTranscript?: string
  correctedIntent?: string
  correctedOutcome?: string
  reviewTimeMs?: number
}) {
  const item = await db.query.clientQueueItems.findFirst({ where: eq(clientQueueItems.id, input.itemId) })
  if (!item) throw new HttpError(404, 'not_found', 'Queue item not found.')
  if (item.status !== 'pending') {
    throw new HttpError(409, 'invalid_state', 'This item is not awaiting review.')
  }

  const [decision] = await db
    .insert(operatorReviewDecisions)
    .values({
      operatorId: input.operatorId,
      clientItemId: item.externalRef,
      clientItemSnapshot: { content: item.content, clientName: item.clientName, traceData: item.traceData },
      decision: input.decision,
      errTag: input.errTag,
      severity: input.severity,
      notes: input.notes,
      correctedTranscript: input.correctedTranscript,
      correctedIntent: input.correctedIntent,
      correctedOutcome: input.correctedOutcome,
      reviewTimeMs: input.reviewTimeMs,
    })
    .returning()

  // OPERATOR_DECISIONS ('approved'|'escalated'|'rejected') is exactly
  // CLIENT_QUEUE_ITEM_STATUSES minus 'pending' — no status-mapping needed.
  await db.update(clientQueueItems).set({ status: input.decision }).where(eq(clientQueueItems.id, item.id))

  // The real destination for an escalation — before this, escalating just
  // flipped client_queue_items.status and nothing downstream ever
  // surfaced it. One ticket per escalation.
  if (input.decision === 'escalated') {
    await db.insert(clientTickets).values({
      operatorReviewDecisionId: decision.id,
      clientName: item.clientName,
      externalRef: item.externalRef,
      errTag: input.errTag,
      severity: input.severity,
      notes: input.notes,
    })
  }

  await writeAuditLog({
    actorId: input.operatorId,
    actorLabel: input.operatorId,
    actorRole: input.operatorRole,
    action: `operator.decision.${input.decision}`,
    resourceType: 'client_queue_item',
    resourceId: item.id,
    metadata: { errTag: input.errTag, severity: input.severity, notes: input.notes },
  })

  return { item: { ...item, status: input.decision }, decision }
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

function computeProfileStrength(
  user: { displayName: string | null },
  application: {
    location: string
    languages: unknown
    dialect: string | null
    academicBackground: string
    englishProficiency: string
    availability: unknown
    experience: string | null
  } | null,
): number {
  let filled = 0
  if (user.displayName) filled++
  if (application) {
    if (application.location) filled++
    if (Array.isArray(application.languages) && application.languages.length > 0) filled++
    if (application.dialect) filled++
    if (application.academicBackground) filled++
    if (application.englishProficiency) filled++
    if (Array.isArray(application.availability) && application.availability.length > 0) filled++
    if (application.experience) filled++
  }
  return Math.round((filled / 8) * 100)
}

export async function getProfile(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })
  if (!user) throw new HttpError(404, 'not_found', 'User not found.')

  const application = await db.query.operatorApplications.findFirst({
    where: eq(operatorApplications.userId, userId),
  })

  const profileStrength = computeProfileStrength(user, application ?? null)

  return {
    user: {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      status: user.status,
      operatorCode: user.operatorCode,
      createdAt: user.createdAt,
    },
    application: application
      ? {
          location: application.location,
          languages: application.languages,
          dialect: application.dialect,
          academicBackground: application.academicBackground,
          englishProficiency: application.englishProficiency,
          availability: application.availability,
          experience: application.experience,
        }
      : null,
    profileStrength,
  }
}

export async function updateProfile(
  userId: string,
  data: {
    displayName?: string
    location?: string
    languages?: { language: string; fluency: string }[]
    dialect?: string
    academicBackground?: string
    englishProficiency?: string
    availability?: string[]
    experience?: string
  },
) {
  // Update users table if displayName is provided
  if (data.displayName !== undefined) {
    await db.update(users).set({ displayName: data.displayName }).where(eq(users.id, userId))
  }

  // Update operator_applications table for the remaining fields
  const { displayName: _, ...appFields } = data
  const appUpdate: Record<string, unknown> = {}
  if (appFields.location !== undefined) appUpdate.location = appFields.location
  if (appFields.languages !== undefined) appUpdate.languages = appFields.languages
  if (appFields.dialect !== undefined) appUpdate.dialect = appFields.dialect
  if (appFields.academicBackground !== undefined) appUpdate.academicBackground = appFields.academicBackground
  if (appFields.englishProficiency !== undefined) appUpdate.englishProficiency = appFields.englishProficiency
  if (appFields.availability !== undefined) appUpdate.availability = appFields.availability
  if (appFields.experience !== undefined) appUpdate.experience = appFields.experience

  if (Object.keys(appUpdate).length > 0) {
    await db.update(operatorApplications).set(appUpdate).where(eq(operatorApplications.userId, userId))
  }

  return getProfile(userId)
}

// ---------------------------------------------------------------------------
// Identity Verifications
// ---------------------------------------------------------------------------

export async function getVerifications(userId: string) {
  const verifications = await db.query.identityVerifications.findMany({
    where: eq(identityVerifications.userId, userId),
    orderBy: desc(identityVerifications.createdAt),
  })

  let overallStatus: 'incomplete' | 'rejected' | 'verified' | 'pending'
  if (verifications.length === 0) {
    overallStatus = 'incomplete'
  } else if (verifications.some((v) => v.status === 'rejected')) {
    overallStatus = 'rejected'
  } else if (verifications.every((v) => v.status === 'approved')) {
    overallStatus = 'verified'
  } else {
    overallStatus = 'pending'
  }

  return { verifications, overallStatus }
}

export async function submitVerification(
  userId: string,
  data: {
    documentType: string
    fileName: string
    fileUrl: string
    fileSizeBytes?: string
  },
) {
  const [verification] = await db
    .insert(identityVerifications)
    .values({
      userId,
      documentType: data.documentType as 'government_id' | 'education_certificate' | 'resume' | 'other',
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileSizeBytes: data.fileSizeBytes,
    })
    .returning()

  return verification
}

// ---------------------------------------------------------------------------
// Payout Details
// ---------------------------------------------------------------------------

async function checkIdentityVerified(userId: string): Promise<boolean> {
  const approvedDocs = await db.query.identityVerifications.findFirst({
    where: and(eq(identityVerifications.userId, userId), eq(identityVerifications.status, 'approved')),
  })
  return Boolean(approvedDocs)
}

export async function getPayoutDetails(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })
  if (!user) throw new HttpError(404, 'not_found', 'User not found.')

  const identityVerified = await checkIdentityVerified(userId)

  return {
    payoutDetails: user.payoutDetails,
    identityVerified,
  }
}

// ---------------------------------------------------------------------------
// Agreements
// ---------------------------------------------------------------------------

const REQUIRED_AGREEMENTS: { type: AgreementType; label: string }[] = [
  { type: 'nda', label: 'Non-Disclosure Agreement' },
  { type: 'code_of_conduct', label: 'Reviewer Code of Conduct' },
  { type: 'data_handling', label: 'Data Handling Policy' },
]

export async function getAgreements(userId: string) {
  const agreements = await db.query.operatorAgreements.findMany({
    where: eq(operatorAgreements.userId, userId),
    orderBy: desc(operatorAgreements.signedAt),
  })

  const required = REQUIRED_AGREEMENTS.map((r) => {
    const signed = agreements.find((a) => a.agreementType === r.type)
    return {
      type: r.type,
      label: r.label,
      signed: Boolean(signed),
      signedAt: signed?.signedAt?.toISOString() ?? null,
    }
  })

  return { agreements, required }
}

export async function signAgreement(
  userId: string,
  data: { agreementType: AgreementType; ipAddress?: string; userAgent?: string },
) {
  const existing = await db.query.operatorAgreements.findFirst({
    where: and(eq(operatorAgreements.userId, userId), eq(operatorAgreements.agreementType, data.agreementType)),
  })
  if (existing) {
    throw new HttpError(409, 'already_signed', 'You have already signed this agreement.')
  }

  const [agreement] = await db
    .insert(operatorAgreements)
    .values({
      userId,
      agreementType: data.agreementType,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    })
    .returning()

  return agreement
}

export async function updatePayoutDetails(
  userId: string,
  data: { country: string; bankName: string; accountNumber: string; accountName: string },
) {
  await db.update(users).set({ payoutDetails: data, updatedAt: new Date() }).where(eq(users.id, userId))

  return getPayoutDetails(userId)
}
