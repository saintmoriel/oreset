import { db } from '../db/client'
import { auditLog } from '../db/schema'

type WriteAuditLogInput = {
  actorId?: string | null
  actorLabel: string
  actorRole: string
  action: string
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, unknown>
}

// Called from inside other services (consent, submission, validation,
// QA/operator decisions, RBAC changes) — never exposed as its own
// writable route. Insert-only, no update/delete path exists anywhere.
export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  await db.insert(auditLog).values({
    actorId: input.actorId ?? null,
    actorLabel: input.actorLabel,
    actorRole: input.actorRole,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    metadata: input.metadata,
  })
}
