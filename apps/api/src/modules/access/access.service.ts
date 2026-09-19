import { and, desc, eq } from 'drizzle-orm'
import {
  ADMIN_MODULES,
  ADMIN_MODULE_LABELS,
  ROLE_DEFAULT_MODULES,
  type AdminModule,
  type StaffRole,
} from '@oreset/shared'
import { db } from '../../db/client'
import { moduleAccessRequests, moduleGrants, users } from '../../db/schema'
import { writeAuditLog } from '../../lib/audit'
import { sendMail } from '../../lib/mail'
import { env } from '../../config/env'
import { HttpError } from '../../middleware/error-handler'
import { effectiveModules, activeGrantsByUser } from '../../middleware/modules'

type Actor = { id: string; staffRole: StaffRole | null; label?: string }

async function audit(actor: Actor, action: string, resourceId: string, metadata?: Record<string, unknown>) {
  await writeAuditLog({
    actorId: actor.id,
    actorLabel: actor.label ?? actor.id,
    actorRole: `staff:${actor.staffRole ?? 'unknown'}`,
    action,
    resourceType: 'module_access',
    resourceId,
    metadata,
  })
}

function assertModule(module: string): AdminModule {
  if (!(ADMIN_MODULES as readonly string[]).includes(module)) {
    throw new HttpError(400, 'unknown_module', 'That module does not exist.')
  }
  return module as AdminModule
}

// What one staff member holds, is missing, and has asked for.
export async function getMyAccess(actor: Actor) {
  const [held, grants, myRequests] = await Promise.all([
    effectiveModules(actor.id, actor.staffRole),
    activeGrantsByUser([actor.id]),
    db.query.moduleAccessRequests.findMany({
      where: eq(moduleAccessRequests.userId, actor.id),
      orderBy: [desc(moduleAccessRequests.createdAt)],
      limit: 20,
    }),
  ])
  const defaults = actor.staffRole ? ROLE_DEFAULT_MODULES[actor.staffRole] ?? [] : []
  const myGrants = grants.get(actor.id) ?? []
  const canApprove = held.includes('people')

  return {
    staffRole: actor.staffRole,
    modules: held,
    canApprove,
    catalogue: ADMIN_MODULES.map((m) => ({
      module: m,
      label: ADMIN_MODULE_LABELS[m],
      held: held.includes(m),
      byRole: defaults.includes(m),
      grant: myGrants.find((g) => g.module === m)
        ? { expiresAt: myGrants.find((g) => g.module === m)!.expiresAt?.toISOString() ?? null }
        : null,
      pendingRequest: myRequests.some((r) => r.module === m && r.status === 'pending'),
    })),
    requests: myRequests.map((r) => ({
      id: r.id,
      module: r.module as AdminModule,
      reason: r.reason,
      status: r.status,
      decisionNote: r.decisionNote,
      decidedAt: r.decidedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
  }
}

export async function requestAccess(actor: Actor, input: { module: string; reason: string }) {
  const module = assertModule(input.module)
  const held = await effectiveModules(actor.id, actor.staffRole)
  if (held.includes(module)) throw new HttpError(409, 'already_held', 'You already have this module.')

  const existing = await db.query.moduleAccessRequests.findFirst({
    where: and(
      eq(moduleAccessRequests.userId, actor.id),
      eq(moduleAccessRequests.module, module),
      eq(moduleAccessRequests.status, 'pending'),
    ),
  })
  if (existing) throw new HttpError(409, 'already_requested', 'You already have a pending request for this module.')

  const [row] = await db
    .insert(moduleAccessRequests)
    .values({ userId: actor.id, module, reason: input.reason })
    .returning()

  await audit(actor, 'access.requested', row.id, { module, reason: input.reason })

  if (env.LEADS_NOTIFY_EMAIL) {
    const requester = await db.query.users.findFirst({ where: eq(users.id, actor.id), columns: { displayName: true, email: true } })
    void sendMail({
      to: env.LEADS_NOTIFY_EMAIL,
      subject: `Access request: ${ADMIN_MODULE_LABELS[module]} for ${requester?.displayName ?? requester?.email ?? 'a staff member'}`,
      text: [
        `${requester?.displayName ?? requester?.email ?? 'A staff member'} asked for the "${ADMIN_MODULE_LABELS[module]}" module.`,
        '',
        `Reason: ${input.reason}`,
        '',
        `Decide at ${env.WEB_PUBLIC_URL}/admin/access`,
      ].join('\n'),
    })
  }

  return { id: row.id }
}

// Pending requests from everyone, for approvers.
export async function listPendingRequests() {
  const rows = await db
    .select({
      id: moduleAccessRequests.id,
      module: moduleAccessRequests.module,
      reason: moduleAccessRequests.reason,
      createdAt: moduleAccessRequests.createdAt,
      userId: users.id,
      displayName: users.displayName,
      email: users.email,
      staffRole: users.staffRole,
    })
    .from(moduleAccessRequests)
    .innerJoin(users, eq(users.id, moduleAccessRequests.userId))
    .where(eq(moduleAccessRequests.status, 'pending'))
    .orderBy(desc(moduleAccessRequests.createdAt))
  return rows.map((r) => ({
    id: r.id,
    module: r.module as AdminModule,
    moduleLabel: ADMIN_MODULE_LABELS[r.module as AdminModule] ?? r.module,
    reason: r.reason,
    createdAt: r.createdAt.toISOString(),
    user: { id: r.userId, displayName: r.displayName, email: r.email, staffRole: r.staffRole },
  }))
}

export async function countPendingRequests() {
  const rows = await db
    .select({ id: moduleAccessRequests.id })
    .from(moduleAccessRequests)
    .where(eq(moduleAccessRequests.status, 'pending'))
  return rows.length
}

export async function decideRequest(
  actor: Actor,
  requestId: string,
  input: { decision: 'approved' | 'denied'; note?: string; expiresInDays?: number },
) {
  const request = await db.query.moduleAccessRequests.findFirst({ where: eq(moduleAccessRequests.id, requestId) })
  if (!request) throw new HttpError(404, 'not_found', 'Request not found.')
  if (request.status !== 'pending') throw new HttpError(409, 'already_decided', 'This request was already decided.')
  if (request.userId === actor.id) throw new HttpError(403, 'self_approval', 'You cannot decide your own request.')

  const module = assertModule(request.module)
  let grantId: string | null = null

  if (input.decision === 'approved') {
    const expiresAt = input.expiresInDays ? new Date(Date.now() + input.expiresInDays * 86_400_000) : null
    const [grant] = await db
      .insert(moduleGrants)
      .values({ userId: request.userId, module, reason: request.reason, grantedBy: actor.id, expiresAt })
      .returning()
    grantId = grant.id
  }

  await db
    .update(moduleAccessRequests)
    .set({ status: input.decision, decidedBy: actor.id, decidedAt: new Date(), decisionNote: input.note ?? null, grantId })
    .where(eq(moduleAccessRequests.id, requestId))

  await audit(actor, `access.${input.decision}`, requestId, { module, userId: request.userId, expiresInDays: input.expiresInDays ?? null, note: input.note ?? null })

  const requester = await db.query.users.findFirst({ where: eq(users.id, request.userId), columns: { email: true, displayName: true } })
  if (requester?.email) {
    void sendMail({
      to: requester.email,
      subject: input.decision === 'approved' ? `Access granted: ${ADMIN_MODULE_LABELS[module]}` : `Access request declined: ${ADMIN_MODULE_LABELS[module]}`,
      text: [
        `Hi ${requester.displayName?.split(' ')[0] ?? 'there'},`,
        '',
        input.decision === 'approved'
          ? `Your request for the "${ADMIN_MODULE_LABELS[module]}" module was approved${input.expiresInDays ? ` for ${input.expiresInDays} days` : ''}. It is in your console now.`
          : `Your request for the "${ADMIN_MODULE_LABELS[module]}" module was declined.`,
        input.note ? `\nNote: ${input.note}` : '',
        '',
        `${env.WEB_PUBLIC_URL}/admin/home`,
      ].join('\n'),
    })
  }

  return { grantId }
}

// Direct grant without a request (owner adds a module to someone).
export async function grantModule(actor: Actor, input: { userId: string; module: string; reason: string; expiresInDays?: number }) {
  const module = assertModule(input.module)
  const target = await db.query.users.findFirst({ where: eq(users.id, input.userId), columns: { id: true, role: true, staffRole: true } })
  if (!target || target.role !== 'staff') throw new HttpError(404, 'not_found', 'Staff member not found.')
  const held = await effectiveModules(target.id, target.staffRole)
  if (held.includes(module)) throw new HttpError(409, 'already_held', 'They already have this module.')

  const expiresAt = input.expiresInDays ? new Date(Date.now() + input.expiresInDays * 86_400_000) : null
  const [grant] = await db
    .insert(moduleGrants)
    .values({ userId: target.id, module, reason: input.reason, grantedBy: actor.id, expiresAt })
    .returning()
  await audit(actor, 'access.granted', grant.id, { module, userId: target.id, expiresInDays: input.expiresInDays ?? null, reason: input.reason })
  return { id: grant.id }
}

export async function revokeGrant(actor: Actor, grantId: string) {
  const grant = await db.query.moduleGrants.findFirst({ where: eq(moduleGrants.id, grantId) })
  if (!grant) throw new HttpError(404, 'not_found', 'Grant not found.')
  if (grant.revokedAt) return
  await db.update(moduleGrants).set({ revokedAt: new Date(), revokedBy: actor.id }).where(eq(moduleGrants.id, grantId))
  await audit(actor, 'access.revoked', grantId, { module: grant.module, userId: grant.userId })
}

// Every active grant across staff, for the approver's view.
export async function listActiveGrants() {
  const staff = await db.query.users.findMany({ where: eq(users.role, 'staff'), columns: { id: true, displayName: true, email: true, staffRole: true } })
  const grants = await activeGrantsByUser(staff.map((s) => s.id))
  return staff
    .filter((s) => (grants.get(s.id) ?? []).length > 0)
    .map((s) => ({
      user: { id: s.id, displayName: s.displayName, email: s.email, staffRole: s.staffRole },
      grants: (grants.get(s.id) ?? []).map((g) => ({
        id: g.id,
        module: g.module,
        moduleLabel: ADMIN_MODULE_LABELS[g.module] ?? g.module,
        reason: g.reason,
        expiresAt: g.expiresAt?.toISOString() ?? null,
      })),
    }))
}
