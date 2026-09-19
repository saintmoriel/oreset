import type { Request, Response } from 'express'
import { z } from 'zod'
import * as service from './access.service'

function actor(req: Request) {
  return { id: req.user!.sub, staffRole: req.user!.staffRole ?? null }
}

const requestSchema = z.object({
  module: z.string().min(1),
  reason: z.string().trim().min(10, 'Say why you need it, in a sentence or two.').max(1000),
})

const decideSchema = z.object({
  decision: z.enum(['approved', 'denied']),
  note: z.string().trim().max(1000).optional(),
  expiresInDays: z.number().int().min(1).max(365).optional(),
})

const grantSchema = z.object({
  userId: z.string().uuid(),
  module: z.string().min(1),
  reason: z.string().trim().min(3).max(1000),
  expiresInDays: z.number().int().min(1).max(365).optional(),
})

export async function me(req: Request, res: Response) {
  res.json(await service.getMyAccess(actor(req)))
}

export async function request(req: Request, res: Response) {
  const body = requestSchema.parse(req.body)
  res.status(201).json(await service.requestAccess(actor(req), body))
}

export async function pending(req: Request, res: Response) {
  const [requests, grants] = await Promise.all([service.listPendingRequests(), service.listActiveGrants()])
  res.json({ requests, grants })
}

export async function decide(req: Request, res: Response) {
  const body = decideSchema.parse(req.body)
  res.json(await service.decideRequest(actor(req), req.params.id, body))
}

export async function grant(req: Request, res: Response) {
  const body = grantSchema.parse(req.body)
  res.status(201).json(await service.grantModule(actor(req), body))
}

export async function revoke(req: Request, res: Response) {
  await service.revokeGrant(actor(req), req.params.id)
  res.status(204).end()
}
