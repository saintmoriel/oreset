import type { Request, Response } from 'express'
import * as auditService from './audit.service'

export async function list(_req: Request, res: Response) {
  const entries = await auditService.listAuditLog()
  res.status(200).json({ entries })
}
