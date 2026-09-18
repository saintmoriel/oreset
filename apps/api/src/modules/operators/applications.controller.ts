import type { Request, Response } from 'express'
import { z } from 'zod'
import * as applications from './applications.service'

const rejectSchema = z.object({ reason: z.string().trim().max(2000).optional() })

function actor(req: Request) {
  return { id: req.user!.sub, role: `staff:${req.user!.staffRole ?? 'admin'}` }
}

export async function approve(req: Request, res: Response) {
  const user = await applications.approveApplication(actor(req), req.params.userId)
  res.status(200).json({ user: { id: user.id, status: user.status } })
}

export async function reject(req: Request, res: Response) {
  const { reason } = rejectSchema.parse(req.body ?? {})
  const user = await applications.rejectApplication(actor(req), req.params.userId, reason)
  res.status(200).json({ user: { id: user.id, status: user.status } })
}
