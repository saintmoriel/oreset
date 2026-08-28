import { and, desc, eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { auditLog, type AuditLogEntry } from '../../db/schema'

export async function listAuditLog(filters: {
  limit?: number
  action?: string
  actorRole?: string
  resourceType?: string
} = {}): Promise<AuditLogEntry[]> {
  const { limit = 100, action, actorRole, resourceType } = filters
  const conditions = [
    action ? eq(auditLog.action, action) : undefined,
    actorRole ? eq(auditLog.actorRole, actorRole) : undefined,
    resourceType ? eq(auditLog.resourceType, resourceType) : undefined,
  ].filter((c): c is NonNullable<typeof c> => c !== undefined)

  return db.query.auditLog.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: desc(auditLog.createdAt),
    limit,
  })
}
