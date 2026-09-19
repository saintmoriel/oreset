import { and, asc, count, desc, eq, sql, notInArray, inArray, avg } from 'drizzle-orm'
import type { AgreementType, VulnTag, ExploitStatus, OperatorDecision, RoleType, Severity } from '@oreset/shared'
import { VULN_TAGS } from '@oreset/shared'
import { db } from '../../db/client'
import { clientQueueItems, operatorReviewDecisions, clientTickets, users, operatorApplications, identityVerifications, operatorAgreements, consensusPairs, calibrationAttempts, verifiedFindings, type User } from '../../db/schema'
import { AGREEMENT_DOCUMENTS, AGREEMENT_ORDER, hashAgreementText } from './agreement-texts'
import { writeAuditLog } from '../../lib/audit'
import { HttpError } from '../../middleware/error-handler'
import { assertAcknowledged } from '../engagements/engagements.service'
import { handleDualSolveDecision } from '../consensus/consensus.service'
import { applyRetestOutcome } from '../findings/findings.service'
import { fireWebhooksForItem } from '../../lib/webhooks'

export async function getQueue(operatorId?: string) {
  // Items this operator already reviewed in dual-solve mode
  const alreadyReviewedSubquery = operatorId
    ? db
        .select({ itemId: consensusPairs.clientItemId })
        .from(consensusPairs)
        .where(sql`(${consensusPairs.reviewerOneId} = ${operatorId} OR ${consensusPairs.reviewerTwoId} = ${operatorId})`)
    : null

  // Show pending items + in_review items (dual-solve waiting for second reviewer)
  const statusFilter = sql`${clientQueueItems.status} IN ('pending', 'in_review')`
  const excludeAlreadyReviewed = alreadyReviewedSubquery
    ? sql`${clientQueueItems.id} NOT IN (${alreadyReviewedSubquery})`
    : null

  const baseCondition = excludeAlreadyReviewed
    ? sql`${statusFilter} AND ${excludeAlreadyReviewed}`
    : statusFilter

  if (!operatorId) {
    return db
      .select()
      .from(clientQueueItems)
      .where(baseCondition)
      .orderBy(asc(clientQueueItems.createdAt))
  }

  const application = await db.query.operatorApplications.findFirst({
    where: eq(operatorApplications.userId, operatorId),
  })

  const operatorLanguages = Array.isArray(application?.languages)
    ? (application.languages as { language: string }[]).map((l) => l.language.toLowerCase())
    : []

  // Domains this operator has reviewed before (experience signal)
  const domainExperience = await db
    .select({ domain: sql<string>`client_item_snapshot->'traceData'->>'domain'` })
    .from(operatorReviewDecisions)
    .where(eq(operatorReviewDecisions.operatorId, operatorId))
    .groupBy(sql`client_item_snapshot->'traceData'->>'domain'`)

  const knownDomains = domainExperience
    .map((d) => d.domain)
    .filter(Boolean)
    .map((d) => d.toLowerCase())

  // Build multi-factor sort: language match (40%), domain match (30%), FIFO (30%)
  const sortExpressions: ReturnType<typeof sql>[] = []

  if (operatorLanguages.length > 0) {
    const langConditions = operatorLanguages.map((lang) => sql`lower(trace_data->>'language') = ${lang}`)
    const langMatch = langConditions.length === 1
      ? langConditions[0]
      : sql.join(langConditions, sql` OR `)
    sortExpressions.push(sql`CASE WHEN (${langMatch}) THEN 0 ELSE 1 END`)
  }

  if (knownDomains.length > 0) {
    const domainConditions = knownDomains.map((d) => sql`lower(trace_data->>'domain') = ${d}`)
    const domainMatch = domainConditions.length === 1
      ? domainConditions[0]
      : sql.join(domainConditions, sql` OR `)
    sortExpressions.push(sql`CASE WHEN (${domainMatch}) THEN 0 ELSE 1 END`)
  }

  sortExpressions.push(sql`${clientQueueItems.createdAt} ASC`)

  return db
    .select()
    .from(clientQueueItems)
    .where(baseCondition)
    .orderBy(...sortExpressions)
}

export async function getQueueCount(): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(clientQueueItems)
    .where(sql`${clientQueueItems.status} IN ('pending', 'in_review')`)
  return row?.value ?? 0
}

// A tester's own decisions, each with the auditor's verdict when one exists.
// Verdicts are how testers learn; hiding them helps nobody.
export async function getMyDecisions(operatorId: string) {
  const decisions = await db.query.operatorReviewDecisions.findMany({
    where: eq(operatorReviewDecisions.operatorId, operatorId),
    orderBy: desc(operatorReviewDecisions.createdAt),
    limit: 100,
    with: { ticket: true },
  })
  if (decisions.length === 0) return []
  const verdicts = await db.query.verifiedFindings.findMany({
    where: inArray(verifiedFindings.reviewDecisionId, decisions.map((d) => d.id)),
    columns: { reviewDecisionId: true, verdict: true, adjustedSeverity: true, auditorNotes: true, status: true, verifiedAt: true, closedAt: true },
  })
  const byDecision = new Map(verdicts.map((v) => [v.reviewDecisionId, v]))
  return decisions.map((d) => {
    const v = byDecision.get(d.id)
    return {
      ...d,
      verdict: v
        ? {
            verdict: v.verdict,
            adjustedSeverity: v.adjustedSeverity,
            auditorNotes: v.auditorNotes,
            status: v.status,
            verifiedAt: v.verifiedAt.toISOString(),
            closedAt: v.closedAt?.toISOString() ?? null,
          }
        : null,
    }
  })
}

export async function getMyStats(operatorId: string) {
  const decisions = await db.query.operatorReviewDecisions.findMany({
    where: eq(operatorReviewDecisions.operatorId, operatorId),
    with: { ticket: true },
  })

  const today = new Date().toISOString().slice(0, 10)
  const reviewedToday = decisions.filter((d) => d.createdAt.toISOString().slice(0, 10) === today).length
  const exploitedAllTime = decisions.filter((d) => d.decision === 'exploited').length
  const defendedAllTime = decisions.filter((d) => d.decision === 'defended').length
  const escalatedAllTime = decisions.filter((d) => d.decision === 'escalated').length
  const inconclusiveAllTime = decisions.filter((d) => d.decision === 'inconclusive').length
  const reviewedAllTime = decisions.length
  const exploitRate = reviewedAllTime > 0 ? Math.round((exploitedAllTime / reviewedAllTime) * 100) : null

  const vulnTagBreakdown = Object.fromEntries(VULN_TAGS.map((tag) => [tag, 0])) as Record<VulnTag, number>
  for (const d of decisions) {
    if (d.vulnTag) vulnTagBreakdown[d.vulnTag] += 1
  }

  const openTicketsFromMe = decisions.filter((d) => d.ticket && d.ticket.status === 'open').length

  return {
    queueRemaining: await getQueueCount(),
    reviewedToday,
    reviewedAllTime,
    exploitedAllTime,
    defendedAllTime,
    escalatedAllTime,
    inconclusiveAllTime,
    exploitRate,
    vulnTagBreakdown,
    openTicketsFromMe,
  }
}

export async function decide(input: {
  itemId: string
  operatorId: string
  operatorRole: RoleType
  decision: OperatorDecision
  vulnTag?: VulnTag
  severity?: Severity
  exploitStatus?: ExploitStatus
  notes?: string
  reproductionSteps?: string
  recommendedFix?: string
  reviewTimeMs?: number
}) {
  const item = await db.query.clientQueueItems.findFirst({ where: eq(clientQueueItems.id, input.itemId) })
  if (!item) throw new HttpError(404, 'not_found', 'Queue item not found.')

  // Rules of Engagement gate: no decision on an engagement's scenario until
  // the tester has acknowledged the current rules for it.
  if (item.engagementId) await assertAcknowledged(item.engagementId, input.operatorId)

  if (item.requiresDualSolve) {
    return handleDualSolveDecision(input)
  }

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
      vulnTag: input.vulnTag,
      severity: input.severity,
      exploitStatus: input.exploitStatus,
      notes: input.notes,
      reproductionSteps: input.reproductionSteps,
      recommendedFix: input.recommendedFix,
      reviewTimeMs: input.reviewTimeMs,
    })
    .returning()

  await db.update(clientQueueItems).set({ status: input.decision }).where(eq(clientQueueItems.id, item.id))

  // Retest of a previously verified finding: close it or reopen it.
  const retestOf = (item.traceData as Record<string, unknown> | null)?.retestOf
  if (typeof retestOf === 'string') {
    await applyRetestOutcome({
      findingId: retestOf,
      decision: input.decision,
      operatorId: input.operatorId,
      notes: input.notes,
    })
  }

  if (input.decision === 'escalated') {
    await db.insert(clientTickets).values({
      operatorReviewDecisionId: decision.id,
      clientName: item.clientName,
      externalRef: item.externalRef,
      vulnTag: input.vulnTag,
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
    metadata: { vulnTag: input.vulnTag, severity: input.severity, exploitStatus: input.exploitStatus },
  })

  const webhookEvent = input.decision === 'escalated' ? 'case.escalated' as const : 'case.completed' as const
  fireWebhooksForItem(item.id, webhookEvent, {
    decision: input.decision,
    vulnTag: input.vulnTag ?? null,
    severity: input.severity ?? null,
    exploitStatus: input.exploitStatus ?? null,
  })

  return { item: { ...item, status: input.decision }, decision }
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

// What a complete tester profile contains. Required fields gate nothing yet
// but are named so the profile page can say exactly what is missing.
const PROFILE_FIELDS: { key: string; label: string; required: boolean; filled: (u: User, a: Record<string, unknown> | null) => boolean }[] = [
  { key: 'avatar', label: 'Profile photo', required: true, filled: (u) => !!u.avatarDataUrl },
  { key: 'displayName', label: 'Full name', required: true, filled: (u) => !!u.displayName?.trim() },
  { key: 'username', label: 'Username', required: true, filled: (u) => !!u.username },
  { key: 'phone', label: 'Phone or WhatsApp', required: true, filled: (u) => !!u.phone },
  { key: 'location', label: 'Location', required: true, filled: (_u, a) => !!a?.location },
  { key: 'languages', label: 'Languages', required: true, filled: (_u, a) => Array.isArray(a?.languages) && (a!.languages as unknown[]).length > 0 },
  { key: 'securityExperienceYears', label: 'Years of security testing', required: true, filled: (_u, a) => !!a?.securityExperienceYears },
  { key: 'experience', label: 'Experience', required: true, filled: (_u, a) => !!a?.experience },
  { key: 'availability', label: 'Availability', required: false, filled: (_u, a) => Array.isArray(a?.availability) && (a!.availability as unknown[]).length > 0 },
  { key: 'tools', label: 'Tools', required: false, filled: (_u, a) => !!a?.tools },
  { key: 'portfolioUrl', label: 'Portfolio link', required: false, filled: (_u, a) => !!a?.portfolioUrl },
]

function profileCompleteness(user: User, application: Record<string, unknown> | null) {
  const rows = PROFILE_FIELDS.map((f) => ({ key: f.key, label: f.label, required: f.required, filled: f.filled(user, application) }))
  const filled = rows.filter((r) => r.filled).length
  return {
    strength: Math.round((filled / rows.length) * 100),
    missingRequired: rows.filter((r) => r.required && !r.filled).map((r) => ({ key: r.key, label: r.label })),
    fields: rows,
  }
}

const USERNAME_RE = /^[a-z0-9_]{3,24}$/
const AVATAR_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/
const AVATAR_MAX_CHARS = 120_000 // about 90 KB of image

export async function getProfile(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })
  if (!user) throw new HttpError(404, 'not_found', 'User not found.')

  const application = await db.query.operatorApplications.findFirst({
    where: eq(operatorApplications.userId, userId),
  })

  const completeness = profileCompleteness(user, (application as Record<string, unknown> | null) ?? null)

  return {
    user: {
      id: user.id,
      displayName: user.displayName,
      username: user.username,
      avatarDataUrl: user.avatarDataUrl,
      email: user.email,
      phone: user.phone,
      status: user.status,
      operatorCode: user.operatorCode,
      createdAt: user.createdAt,
    },
    application: application
      ? {
          location: application.location,
          languages: application.languages,
          dialect: application.dialect,
          securityExperienceYears: application.securityExperienceYears,
          tools: application.tools,
          portfolioUrl: application.portfolioUrl,
          availability: application.availability,
          experience: application.experience,
        }
      : null,
    profileStrength: completeness.strength,
    missingRequired: completeness.missingRequired,
    fields: completeness.fields,
  }
}

export async function updateProfile(
  userId: string,
  data: {
    displayName?: string
    username?: string
    avatarDataUrl?: string | null
    phone?: string
    location?: string
    languages?: { language: string; fluency: string }[]
    dialect?: string
    securityExperienceYears?: string
    tools?: string
    portfolioUrl?: string
    availability?: string[]
    experience?: string
  },
) {
  const userUpdate: Partial<typeof users.$inferInsert> = {}
  if (data.displayName !== undefined) userUpdate.displayName = data.displayName.trim()
  if (data.phone !== undefined) userUpdate.phone = data.phone.trim()
  if (data.username !== undefined) {
    const username = data.username.trim().toLowerCase()
    if (!USERNAME_RE.test(username)) throw new HttpError(400, 'bad_username', 'Usernames are 3 to 24 characters: lowercase letters, digits and underscores.')
    const taken = await db.query.users.findFirst({ where: and(eq(users.username, username), sql`${users.id} <> ${userId}`), columns: { id: true } })
    if (taken) throw new HttpError(409, 'username_taken', 'That username is taken. Try another.')
    userUpdate.username = username
  }
  if (data.avatarDataUrl !== undefined) {
    if (data.avatarDataUrl === null) userUpdate.avatarDataUrl = null
    else {
      if (data.avatarDataUrl.length > AVATAR_MAX_CHARS || !AVATAR_RE.test(data.avatarDataUrl)) {
        throw new HttpError(400, 'bad_avatar', 'The photo must be a JPEG, PNG or WebP under about 90 KB. The page resizes it for you; try a different image.')
      }
      userUpdate.avatarDataUrl = data.avatarDataUrl
    }
  }
  if (Object.keys(userUpdate).length > 0) {
    await db.update(users).set({ ...userUpdate, updatedAt: new Date() }).where(eq(users.id, userId))
  }

  const appUpdate: Record<string, unknown> = {}
  if (data.location !== undefined) appUpdate.location = data.location
  if (data.languages !== undefined) appUpdate.languages = data.languages
  if (data.dialect !== undefined) appUpdate.dialect = data.dialect
  if (data.securityExperienceYears !== undefined) appUpdate.securityExperienceYears = data.securityExperienceYears
  if (data.tools !== undefined) appUpdate.tools = data.tools
  if (data.portfolioUrl !== undefined) appUpdate.portfolioUrl = data.portfolioUrl
  if (data.availability !== undefined) appUpdate.availability = data.availability
  if (data.experience !== undefined) appUpdate.experience = data.experience

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

// Five acceptances, each at its current version. An older acceptance still
// shows in history but does not count; the tester re-accepts the new text.
export async function getAgreements(userId: string) {
  const agreements = await db.query.operatorAgreements.findMany({
    where: eq(operatorAgreements.userId, userId),
    orderBy: desc(operatorAgreements.signedAt),
  })

  const required = AGREEMENT_ORDER.map((type) => {
    const doc = AGREEMENT_DOCUMENTS[type]
    const current = agreements.find((a) => a.agreementType === type && a.version === doc.version)
    const older = agreements.find((a) => a.agreementType === type && a.version !== doc.version)
    return {
      type,
      label: doc.label,
      version: doc.version,
      summary: doc.summary,
      text: doc.text,
      signed: Boolean(current),
      signedAt: current?.signedAt?.toISOString() ?? null,
      outdated: !current && Boolean(older),
      previousVersion: older?.version ?? null,
    }
  })

  return {
    agreements: agreements.map((a) => ({
      id: a.id,
      agreementType: a.agreementType,
      version: a.version,
      signedAt: a.signedAt.toISOString(),
      ipAddress: a.ipAddress,
      textHash: a.textHash,
    })),
    required,
    complete: required.every((r) => r.signed),
  }
}

export async function signAgreement(
  userId: string,
  data: { agreementType: AgreementType; ipAddress?: string; userAgent?: string },
) {
  const doc = AGREEMENT_DOCUMENTS[data.agreementType]
  if (!doc) throw new HttpError(400, 'unknown_agreement', 'Unknown agreement.')

  const existing = await db.query.operatorAgreements.findFirst({
    where: and(
      eq(operatorAgreements.userId, userId),
      eq(operatorAgreements.agreementType, data.agreementType),
      eq(operatorAgreements.version, doc.version),
    ),
  })
  if (existing) {
    throw new HttpError(409, 'already_signed', 'You have already accepted the current version of this agreement.')
  }

  const [agreement] = await db
    .insert(operatorAgreements)
    .values({
      userId,
      agreementType: data.agreementType,
      version: doc.version,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      acceptedText: doc.text,
      textHash: hashAgreementText(doc.text),
    })
    .returning()

  return {
    id: agreement.id,
    agreementType: agreement.agreementType,
    version: agreement.version,
    signedAt: agreement.signedAt.toISOString(),
    ipAddress: agreement.ipAddress,
    textHash: agreement.textHash,
  }
}

export async function updatePayoutDetails(
  userId: string,
  data: { country: string; bankName: string; accountNumber: string; accountName: string },
) {
  await db.update(users).set({ payoutDetails: data, updatedAt: new Date() }).where(eq(users.id, userId))

  return getPayoutDetails(userId)
}
