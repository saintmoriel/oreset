import type { Request, Response } from 'express'
import { z } from 'zod'
import * as service from './leads.service'
import { HttpError } from '../../middleware/error-handler'

const createSchema = z.object({
  kind: z.enum(['pilot', 'contact']),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  organization: z.string().trim().max(200).optional(),
  agentType: z.string().trim().max(120).optional(),
  languages: z.string().trim().max(300).optional(),
  audience: z.string().trim().max(60).optional(),
  message: z.string().trim().min(1).max(5000),
  sourcePath: z.string().trim().max(300).optional(),
  // Honeypot: real users never fill this. Bots do.
  website: z.string().max(0).optional(),
})

const updateSchema = z
  .object({
    status: z.enum(service.LEAD_STATUSES).optional(),
    notes: z.string().max(5000).optional(),
  })
  .refine((v) => v.status !== undefined || v.notes !== undefined, { message: 'Nothing to update' })

// Public endpoint, so a small in-memory rate limit per IP. Enough to stop a
// script from filling the inbox; not a substitute for a WAF.
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 5
const hits = new Map<string, { count: number; windowStart: number }>()

function rateLimit(ip: string) {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now })
    return
  }
  entry.count += 1
  if (entry.count > MAX_PER_WINDOW) {
    throw new HttpError(429, 'rate_limited', 'Too many requests. Please try again in a minute.')
  }
}

export async function create(req: Request, res: Response) {
  rateLimit(req.ip ?? 'unknown')
  const body = createSchema.parse(req.body)
  const { website: _honeypot, ...input } = body
  const lead = await service.createLead({ ...input, userAgent: req.get('user-agent') ?? undefined })
  res.status(201).json({ id: lead.id, receivedAt: lead.createdAt })
}

export async function list(req: Request, res: Response) {
  const items = await service.listLeads(req.query.status as string | undefined)
  res.status(200).json({ leads: items })
}

export async function update(req: Request, res: Response) {
  const body = updateSchema.parse(req.body)
  const lead = await service.updateLead(
    { id: req.user!.sub, role: `staff:${req.user!.staffRole ?? 'admin'}` },
    req.params.id,
    body,
  )
  res.status(200).json({ lead })
}
