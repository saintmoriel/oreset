import crypto from 'node:crypto'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import type { RoleType, StaffRole, UserStatus } from '@oreset/shared'
import { db } from '../../db/client'
import {
  users,
  sessions,
  operatorAgreements,
  identityVerifications,
  operatorApplications,
  clientQueueItems,
  invoices,
} from '../../db/schema'
import { hashPassword } from '../../lib/password'
import { writeAuditLog } from '../../lib/audit'
import { HttpError } from '../../middleware/error-handler'
import { getBuyerFindings } from '../findings/findings.service'

// ---------------------------------------------------------------------------
// Owner's console: who has an account, what they can reach, who our clients
// are. Passwords are never readable; what an admin gets is the account, its
// role and status, when it was last used, and the power to suspend it or
// force a reset. Every action here is audit-logged.
// ---------------------------------------------------------------------------

// What each role can reach. Kept here, next to the RBAC gates it describes,
// so the People page never drifts from the routes.
export const ROLE_ACCESS: Record<string, { label: string; portal: string; reaches: string[] }> = {
  'staff:admin': {
    label: 'Admin',
    portal: '/admin',
    reaches: ['Everything in the admin portal', 'People and access', 'Clients and provisioning', 'Findings verification', 'Escalations and adjudication', 'Payouts', 'Audit log'],
  },
  'staff:reviewer_lead': {
    label: 'Lead auditor',
    portal: '/admin',
    reaches: ['Findings verification', 'Escalations', 'Consensus adjudication', 'Calibration cases', 'Regression exports', 'Tester performance'],
  },
  'staff:compliance': {
    label: 'Compliance',
    portal: '/admin',
    reaches: ['Audit log', 'Overview'],
  },
  'staff:qa_reviewer': {
    label: 'QA reviewer (legacy)',
    portal: '/qa',
    reaches: ['Hidden data-QA portal only'],
  },
  operator: {
    label: 'Red team tester',
    portal: '/operator',
    reaches: ['Own scenario queue', 'Own history and stats', 'Calibration', 'Own profile, agreements, payouts'],
  },
  buyer: {
    label: 'Client',
    portal: '/buyer',
    reaches: ['Own findings and resilience score', 'Own scenarios', 'Own regression export', 'Own webhooks'],
  },
  contributor: {
    label: 'Contributor (legacy)',
    portal: '/capture',
    reaches: ['Hidden data-collection portal only'],
  },
}

export function accessKey(u: { role: RoleType; staffRole: StaffRole | null }) {
  return u.role === 'staff' ? `staff:${u.staffRole ?? 'unknown'}` : u.role
}

export async function listPeople() {
  const rows = await db.query.users.findMany({
    columns: {
      id: true, role: true, staffRole: true, email: true, phone: true, displayName: true,
      operatorCode: true, status: true, lastLoginAt: true, createdAt: true,
    },
    orderBy: [desc(users.createdAt)],
  })

  const operatorIds = rows.filter((r) => r.role === 'operator').map((r) => r.id)
  const [agreements, verifications, applications] = operatorIds.length
    ? await Promise.all([
        db.select({ userId: operatorAgreements.userId, n: sql<number>`count(*)::int` })
          .from(operatorAgreements).where(inArray(operatorAgreements.userId, operatorIds)).groupBy(operatorAgreements.userId),
        db.select({ userId: identityVerifications.userId, status: identityVerifications.status })
          .from(identityVerifications).where(inArray(identityVerifications.userId, operatorIds)),
        db.select({ userId: operatorApplications.userId, location: operatorApplications.location, languages: operatorApplications.languages })
          .from(operatorApplications).where(inArray(operatorApplications.userId, operatorIds)),
      ])
    : [[], [], []]

  const agreementsBy = new Map(agreements.map((a) => [a.userId, a.n]))
  const verificationBy = new Map<string, 'verified' | 'pending' | 'rejected' | 'none'>()
  for (const v of verifications) {
    const cur = verificationBy.get(v.userId)
    const next = v.status === 'approved' ? 'verified' : v.status === 'rejected' ? 'rejected' : 'pending'
    if (!cur || next === 'rejected' || (cur === 'pending' && next === 'verified')) verificationBy.set(v.userId, next)
  }
  const appBy = new Map(applications.map((a) => [a.userId, a]))

  return rows.map((u) => {
    const key = accessKey(u)
    const app = appBy.get(u.id)
    return {
      id: u.id,
      role: u.role,
      staffRole: u.staffRole,
      accessKey: key,
      accessLabel: ROLE_ACCESS[key]?.label ?? key,
      email: u.email,
      phone: u.phone,
      displayName: u.displayName,
      operatorCode: u.operatorCode,
      status: u.status,
      lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
      createdAt: u.createdAt.toISOString(),
      agreementsSigned: u.role === 'operator' ? (agreementsBy.get(u.id) ?? 0) : null,
      verification: u.role === 'operator' ? (verificationBy.get(u.id) ?? 'none') : null,
      location: app?.location ?? null,
      languages: Array.isArray(app?.languages) ? (app!.languages as { language: string }[]).map((l) => l.language) : [],
    }
  })
}

function generateTemporaryPassword() {
  // 12 url-safe characters. Shown to the admin exactly once.
  return crypto.randomBytes(9).toString('base64url')
}

async function audit(actor: { id: string; role: string }, action: string, resourceId: string, metadata?: Record<string, unknown>) {
  await writeAuditLog({
    actorId: actor.id,
    actorLabel: actor.id,
    actorRole: actor.role,
    action,
    resourceType: 'user',
    resourceId,
    metadata,
  })
}

export async function createStaff(
  actor: { id: string; role: string },
  input: { email: string; displayName: string; staffRole: StaffRole },
) {
  const existing = await db.query.users.findFirst({ where: eq(users.email, input.email) })
  if (existing) throw new HttpError(409, 'email_taken', 'An account with that email already exists.')

  const temporaryPassword = generateTemporaryPassword()
  const [user] = await db
    .insert(users)
    .values({
      role: 'staff',
      staffRole: input.staffRole,
      email: input.email,
      displayName: input.displayName,
      passwordHash: await hashPassword(temporaryPassword),
      status: 'active',
    })
    .returning()

  await audit(actor, 'people.staff_created', user.id, { email: input.email, staffRole: input.staffRole })
  return { user: { id: user.id, email: user.email, displayName: user.displayName, staffRole: user.staffRole }, temporaryPassword }
}

export async function updateUser(
  actor: { id: string; role: string },
  userId: string,
  input: { status?: Extract<UserStatus, 'active' | 'suspended'>; staffRole?: StaffRole; displayName?: string },
) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) throw new HttpError(404, 'not_found', 'Account not found.')

  if (input.status === 'suspended' && user.id === actor.id) {
    throw new HttpError(400, 'cannot_suspend_self', 'You cannot suspend your own account.')
  }
  if (input.staffRole && user.role !== 'staff') {
    throw new HttpError(400, 'not_staff', 'Only staff accounts have a staff role.')
  }
  if (input.staffRole && user.id === actor.id && input.staffRole !== 'admin') {
    throw new HttpError(400, 'cannot_demote_self', 'You cannot remove your own admin role.')
  }

  const updates: Partial<typeof users.$inferInsert> = { updatedAt: new Date() }
  if (input.status) updates.status = input.status
  if (input.staffRole) updates.staffRole = input.staffRole
  if (input.displayName !== undefined) updates.displayName = input.displayName

  const [updated] = await db.update(users).set(updates).where(eq(users.id, userId)).returning()

  // Suspension takes effect immediately: kill every live session.
  if (input.status === 'suspended') {
    await db.delete(sessions).where(eq(sessions.userId, userId))
  }

  await audit(actor, 'people.updated', userId, { ...input })
  return updated
}

export async function resetPassword(actor: { id: string; role: string }, userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) throw new HttpError(404, 'not_found', 'Account not found.')
  if (!user.email) throw new HttpError(400, 'no_password_login', 'This account signs in with a phone code, not a password.')

  const temporaryPassword = generateTemporaryPassword()
  await db.update(users).set({ passwordHash: await hashPassword(temporaryPassword), updatedAt: new Date() }).where(eq(users.id, userId))
  await db.delete(sessions).where(eq(sessions.userId, userId))

  await audit(actor, 'people.password_reset', userId)
  return { temporaryPassword }
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

export async function listClients() {
  const buyers = await db.query.users.findMany({
    where: eq(users.role, 'buyer'),
    columns: { id: true, email: true, displayName: true, status: true, lastLoginAt: true, createdAt: true },
    orderBy: [desc(users.createdAt)],
  })
  if (buyers.length === 0) return []

  const buyerIds = buyers.map((b) => b.id)

  const [scenarioRows, paidRows] = await Promise.all([
    db
      .select({
        submittedBy: clientQueueItems.submittedBy,
        clientName: sql<string>`max(${clientQueueItems.clientName})`,
        total: sql<number>`count(*)::int`,
        inProgress: sql<number>`count(*) filter (where ${clientQueueItems.status} in ('pending', 'in_review', 'consensus_split'))::int`,
        lastActivity: sql<string>`max(${clientQueueItems.createdAt})`,
      })
      .from(clientQueueItems)
      .where(inArray(clientQueueItems.submittedBy, buyerIds))
      .groupBy(clientQueueItems.submittedBy),
    db
      .select({
        buyerId: invoices.buyerId,
        currency: invoices.currency,
        paidMinorUnits: sql<number>`coalesce(sum(${invoices.amountMinorUnits}), 0)::int`,
      })
      .from(invoices)
      .where(and(inArray(invoices.buyerId, buyerIds), eq(invoices.status, 'paid')))
      .groupBy(invoices.buyerId, invoices.currency),
  ])

  const scenariosBy = new Map(scenarioRows.map((r) => [r.submittedBy!, r]))
  const paidBy = new Map<string, { currency: string; paidMinorUnits: number }[]>()
  for (const p of paidRows) {
    const list = paidBy.get(p.buyerId) ?? []
    list.push({ currency: p.currency, paidMinorUnits: p.paidMinorUnits })
    paidBy.set(p.buyerId, list)
  }

  // Resilience per client reuses the exact computation the client sees.
  const findingsByBuyer = await Promise.all(buyerIds.map((id) => getBuyerFindings(id)))

  return buyers.map((b, i) => {
    const s = scenariosBy.get(b.id)
    const f = findingsByBuyer[i]
    return {
      id: b.id,
      email: b.email,
      displayName: b.displayName,
      status: b.status,
      agentName: s?.clientName ?? null,
      scenariosTotal: s?.total ?? 0,
      scenariosInProgress: s?.inProgress ?? 0,
      findingsOpen: f.counts.open,
      findingsInRetest: f.counts.fixSubmitted,
      findingsClosed: f.counts.closed,
      pendingVerification: f.counts.pendingVerification,
      resilienceScore: f.score,
      resilienceLabel: f.label,
      paid: paidBy.get(b.id) ?? [],
      lastActivityAt: s?.lastActivity ? new Date(s.lastActivity).toISOString() : null,
      lastLoginAt: b.lastLoginAt?.toISOString() ?? null,
      createdAt: b.createdAt.toISOString(),
    }
  })
}

// Business strip on the admin home.
export async function getBusinessNumbers() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [[clients], [testers], [engagements], revenue] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(users).where(and(eq(users.role, 'buyer'), eq(users.status, 'active'))),
    db.select({ n: sql<number>`count(*)::int` }).from(users).where(and(eq(users.role, 'operator'), eq(users.status, 'active'))),
    db
      .select({ n: sql<number>`count(distinct ${clientQueueItems.submittedBy})::int` })
      .from(clientQueueItems)
      .where(sql`${clientQueueItems.status} in ('pending', 'in_review', 'consensus_split')`),
    db
      .select({ currency: invoices.currency, minorUnits: sql<number>`coalesce(sum(${invoices.amountMinorUnits}), 0)::int` })
      .from(invoices)
      .where(and(eq(invoices.status, 'paid'), sql`${invoices.paidAt} >= ${thirtyDaysAgo}`))
      .groupBy(invoices.currency),
  ])

  return {
    clientsActive: clients?.n ?? 0,
    testersActive: testers?.n ?? 0,
    engagementsRunning: engagements?.n ?? 0,
    revenue30d: revenue.map((r) => ({ currency: r.currency, minorUnits: r.minorUnits })),
  }
}
