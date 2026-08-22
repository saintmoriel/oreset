import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import * as controller from './prompts.controller'

export const promptsRouter = Router()

// Read is open to any authenticated role — both staff authoring/previewing
// and contributors consuming need it, and prompt content isn't sensitive.
promptsRouter.get('/batch/:batchId', requireAuth, asyncHandler(controller.listForBatch))
promptsRouter.post(
  '/batch/:batchId',
  requireAuth,
  requireRole('staff:admin'),
  asyncHandler(controller.create),
)
promptsRouter.patch('/:id', requireAuth, requireRole('staff:admin'), asyncHandler(controller.update))
promptsRouter.delete('/:id', requireAuth, requireRole('staff:admin'), asyncHandler(controller.remove))
