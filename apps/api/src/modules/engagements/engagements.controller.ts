import type { Request, Response } from 'express'
import { z } from 'zod'
import * as service from './engagements.service'

const isoOrNull = z.string().datetime().nullable().optional()

const createSchema = z.object({
  buyerId: z.string().uuid(),
  name: z.string().trim().min(2).max(160),
  agentName: z.string().trim().min(2).max(160),
  tier: z.string(),
  phase: z.string().optional(),
  scope: z.string().max(20_000).optional(),
  rules: z.string().max(40_000).optional(),
  startsAt: isoOrNull,
  endsAt: isoOrNull,
  retestUntil: isoOrNull,
})

const updateSchema = createSchema.omit({ buyerId: true }).partial()

function actor(req: Request) {
  return { id: req.user!.sub, role: req.user!.role === 'staff' ? `staff:${req.user!.staffRole ?? 'unknown'}` : req.user!.role }
}

// Owner / Client Success
export async function listForBuyer(req: Request, res: Response) {
  const buyerId = z.string().uuid().parse(req.query.buyerId)
  res.json({ engagements: await service.listForBuyer(buyerId) })
}

export async function create(req: Request, res: Response) {
  const body = createSchema.parse(req.body)
  res.status(201).json(await service.create(actor(req), body))
}

export async function update(req: Request, res: Response) {
  const body = updateSchema.parse(req.body)
  res.json(await service.update(actor(req), req.params.id, body))
}

// Client
export async function mine(req: Request, res: Response) {
  res.json(await service.forClient(req.user!.sub))
}

// Tester
export async function rules(req: Request, res: Response) {
  res.json(await service.rulesForTester(req.params.id, req.user!.sub))
}

export async function acknowledge(req: Request, res: Response) {
  res.json(await service.acknowledge(req.params.id, req.user!.sub, req.ip))
}
