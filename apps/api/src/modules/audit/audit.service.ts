import { desc } from 'drizzle-orm'
import { db } from '../../db/client'
import { auditLog, type AuditLogEntry } from '../../db/schema'

export async function listAuditLog(limit = 100): Promise<AuditLogEntry[]> {
  return db.query.auditLog.findMany({ orderBy: desc(auditLog.createdAt), limit })
}
