import { Router } from 'express'
import type { Request, Response } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth, sessionOnly } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import * as service from './api-tokens.service'

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  expiresInDays: z.number().int().min(1).max(365).optional(),
})

// Mounted at /api/v1/buyer/api-tokens. Managing tokens always needs a real
// session: a token must not be able to mint more tokens.
export const apiTokensRouter = Router()

apiTokensRouter.get('/', requireAuth, sessionOnly, requireRole('buyer'), asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({ tokens: await service.listTokens(req.user!.sub) })
}))

apiTokensRouter.post('/', requireAuth, sessionOnly, requireRole('buyer'), asyncHandler(async (req: Request, res: Response) => {
  const body = createSchema.parse(req.body)
  res.status(201).json(await service.createToken(req.user!.sub, body))
}))

apiTokensRouter.delete('/:id', requireAuth, sessionOnly, requireRole('buyer'), asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({ token: await service.revokeToken(req.user!.sub, req.params.id) })
}))
