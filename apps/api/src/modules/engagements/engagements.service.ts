import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import {
  ENGAGEMENT_LIVE_PHASES,
  ENGAGEMENT_PHASES,
  ENGAGEMENT_TIERS,
  type EngagementPhase,
  type EngagementTier,
} from '@oreset/shared'
import { db } from '../../db/client'
import { clientQueueItems, engagementAcknowledgements, engagements, users, type Engagement } from '../../db/schema'
import { writeAuditLog } from '../../lib/audit'
import { HttpError } from '../../middleware/error-handler'

type Actor = { id: string; role: string }

function serialize(e: Engagement) {
  return {
    id: e.id,
    buyerId: e.buyerId,
    name: e.name,
    agentName: e.agentName,
    tier: e.tier as EngagementTier,
    phase: e.phase as EngagementPhase,
    scope: e.scope,
    rules: e.rules,
    rulesVersion: e.rulesVersion,
    startsAt: e.startsAt?.toISOString() ?? null,
    endsAt: e.endsAt?.toISOString() ?? null,
    retestUntil: e.retestUntil?.toISOString() ?? null,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }
}
export type EngagementView = ReturnType<typeof serialize>

async function audit(actor: Actor, action: string, resourceId: string, metadata?: Record<string, unknown>) {
  await writeAuditLog({ actorId: actor.id, actorLabel: actor.id, actorRole: actor.role, action, resourceType: 'engagement', resourceId, metadata })
}

// ---------------------------------------------------------------------------
// Owner / Client Success
// ---------------------------------------------------------------------------

export async function listForBuyer(buyerId: string) {
  const rows = await db.query.engagements.findMany({ where: eq(engagements.buyerId, buyerId), orderBy: [desc(engagements.createdAt)] })
  if (rows.length === 0) return []
  const counts = await db
    .select({ engagementId: clientQueueItems.engagementId, n: sql<number>`count(*)::int` })
    .from(clientQueueItems)
    .where(inArray(clientQueueItems.engagementId, rows.map((r) => r.id)))
    .groupBy(clientQueueItems.engagementId)
  const countBy = new Map(counts.map((c) => [c.engagementId, c.n]))
  return rows.map((r) => ({ ...serialize(r), scenarioCount: countBy.get(r.id) ?? 0 }))
}

export async function create(
  actor: Actor,
  input: {
    buyerId: string
    name: string
    agentName: string
    tier: string
    phase?: string
    scope?: string
    rules?: string
    startsAt?: string | null
    endsAt?: string | null
    retestUntil?: string | null
  },
) {
  if (!(ENGAGEMENT_TIERS as readonly string[]).includes(input.tier)) throw new HttpError(400, 'bad_tier', 'Unknown tier.')
  if (input.phase && !(ENGAGEMENT_PHASES as readonly string[]).includes(input.phase)) throw new HttpError(400, 'bad_phase', 'Unknown phase.')
  const buyer = await db.query.users.findFirst({ where: and(eq(users.id, input.buyerId), eq(users.role, 'buyer')), columns: { id: true } })
  if (!buyer) throw new HttpError(404, 'not_found', 'Client not found.')

  const [row] = await db
    .insert(engagements)
    .values({
      buyerId: input.buyerId,
      name: input.name,
      agentName: input.agentName,
      tier: input.tier,
      phase: input.phase ?? 'kickoff',
      scope: input.scope ?? '',
      rules: input.rules ?? '',
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      retestUntil: input.retestUntil ? new Date(input.retestUntil) : null,
      createdBy: actor.id,
    })
    .returning()

  // Scenarios for this client that have no engagement yet join this one,
  // so a client provisioned before engagements existed is not left orphaned.
  await db
    .update(clientQueueItems)
    .set({ engagementId: row.id })
    .where(and(eq(clientQueueItems.submittedBy, input.buyerId), sql`${clientQueueItems.engagementId} IS NULL`))

  await audit(actor, 'engagement.created', row.id, { buyerId: input.buyerId, tier: input.tier })
  return serialize(row)
}

export async function update(
  actor: Actor,
  id: string,
  input: Partial<{
    name: string
    agentName: string
    tier: string
    phase: string
    scope: string
    rules: string
    startsAt: string | null
    endsAt: string | null
    retestUntil: string | null
  }>,
) {
  const existing = await db.query.engagements.findFirst({ where: eq(engagements.id, id) })
  if (!existing) throw new HttpError(404, 'not_found', 'Engagement not found.')
  if (input.tier && !(ENGAGEMENT_TIERS as readonly string[]).includes(input.tier)) throw new HttpError(400, 'bad_tier', 'Unknown tier.')
  if (input.phase && !(ENGAGEMENT_PHASES as readonly string[]).includes(input.phase)) throw new HttpError(400, 'bad_phase', 'Unknown phase.')

  const rulesChanged = input.rules !== undefined && input.rules !== existing.rules
  const [row] = await db
    .update(engagements)
    .set({
      name: input.name ?? existing.name,
      agentName: input.agentName ?? existing.agentName,
      tier: input.tier ?? existing.tier,
      phase: input.phase ?? existing.phase,
      scope: input.scope ?? existing.scope,
      rules: input.rules ?? existing.rules,
      rulesVersion: rulesChanged ? existing.rulesVersion + 1 : existing.rulesVersion,
      startsAt: input.startsAt === undefined ? existing.startsAt : input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt === undefined ? existing.endsAt : input.endsAt ? new Date(input.endsAt) : null,
      retestUntil: input.retestUntil === undefined ? existing.retestUntil : input.retestUntil ? new Date(input.retestUntil) : null,
      updatedAt: new Date(),
    })
    .where(eq(engagements.id, id))
    .returning()

  await audit(actor, 'engagement.updated', id, {
    phase: input.phase && input.phase !== existing.phase ? { from: existing.phase, to: input.phase } : undefined,
    rulesVersion: rulesChanged ? row.rulesVersion : undefined,
  })
  return serialize(row)
}

// The engagement new scenarios for a client should join: the most recent
// one in a live phase. Null when the client has none.
export async function liveEngagementIdFor(buyerId: string): Promise<string | null> {
  const row = await db.query.engagements.findFirst({
    where: and(eq(engagements.buyerId, buyerId), inArray(engagements.phase, [...ENGAGEMENT_LIVE_PHASES])),
    orderBy: [desc(engagements.createdAt)],
    columns: { id: true },
  })
  return row?.id ?? null
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export async function forClient(buyerId: string) {
  const all = await listForBuyer(buyerId)
  const current = all.find((e) => e.phase !== 'closed') ?? all[0] ?? null
  return { current, engagements: all }
}

// ---------------------------------------------------------------------------
// Tester
// ---------------------------------------------------------------------------

export async function rulesForTester(engagementId: string, userId: string) {
  const e = await db.query.engagements.findFirst({ where: eq(engagements.id, engagementId) })
  if (!e) throw new HttpError(404, 'not_found', 'Engagement not found.')
  const ack = await db.query.engagementAcknowledgements.findFirst({
    where: and(
      eq(engagementAcknowledgements.engagementId, engagementId),
      eq(engagementAcknowledgements.userId, userId),
      eq(engagementAcknowledgements.rulesVersion, e.rulesVersion),
    ),
  })
  return {
    id: e.id,
    name: e.name,
    agentName: e.agentName,
    tier: e.tier as EngagementTier,
    phase: e.phase as EngagementPhase,
    scope: e.scope,
    rules: e.rules,
    rulesVersion: e.rulesVersion,
    acknowledged: !!ack,
    acknowledgedAt: ack?.acknowledgedAt.toISOString() ?? null,
  }
}

export async function acknowledge(engagementId: string, userId: string, ip?: string) {
  const e = await db.query.engagements.findFirst({ where: eq(engagements.id, engagementId), columns: { id: true, rulesVersion: true } })
  if (!e) throw new HttpError(404, 'not_found', 'Engagement not found.')
  const existing = await db.query.engagementAcknowledgements.findFirst({
    where: and(
      eq(engagementAcknowledgements.engagementId, engagementId),
      eq(engagementAcknowledgements.userId, userId),
      eq(engagementAcknowledgements.rulesVersion, e.rulesVersion),
    ),
  })
  if (existing) return { acknowledgedAt: existing.acknowledgedAt.toISOString(), rulesVersion: e.rulesVersion }
  const [row] = await db
    .insert(engagementAcknowledgements)
    .values({ engagementId, userId, rulesVersion: e.rulesVersion, ip: ip ?? null })
    .returning()
  await writeAuditLog({ actorId: userId, actorLabel: userId, actorRole: 'operator', action: 'engagement.rules_acknowledged', resourceType: 'engagement', resourceId: engagementId, metadata: { rulesVersion: e.rulesVersion } })
  return { acknowledgedAt: row.acknowledgedAt.toISOString(), rulesVersion: e.rulesVersion }
}

// Called before a tester's decision on a scenario. Throws a 403 the web
// side turns into the Rules of Engagement panel.
export async function assertAcknowledged(engagementId: string, userId: string) {
  const e = await db.query.engagements.findFirst({ where: eq(engagements.id, engagementId), columns: { id: true, rulesVersion: true, rules: true } })
  if (!e) return // engagement gone; do not block legacy work
  if (!e.rules.trim()) return // no rules written yet; nothing to acknowledge
  const ack = await db.query.engagementAcknowledgements.findFirst({
    where: and(
      eq(engagementAcknowledgements.engagementId, engagementId),
      eq(engagementAcknowledgements.userId, userId),
      eq(engagementAcknowledgements.rulesVersion, e.rulesVersion),
    ),
  })
  if (!ack) {
    throw new HttpError(403, 'roe_required', 'Read and acknowledge the Rules of Engagement for this client before working its scenarios.', { engagementId })
  }
}
