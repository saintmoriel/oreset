import type { Request, Response } from 'express'
import { z } from 'zod'
import * as auditService from './audit.service'

const querySchema = z.object({
  action: z.string().min(1).optional(),
  actorRole: z.string().min(1).optional(),
  resourceType: z.string().min(1).optional(),
})

export async function list(req: Request, res: Response) {
  const { action, actorRole, resourceType } = querySchema.parse(req.query)
  const entries = await auditService.listAuditLog({ action, actorRole, resourceType })
  res.status(200).json({ entries })
}
