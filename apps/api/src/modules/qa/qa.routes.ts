import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import * as controller from './qa.controller'

export const qaRouter = Router()

qaRouter.get(
  '/queue',
  requireAuth,
  requireRole('staff:qa_reviewer', 'staff:admin'),
  asyncHandler(controller.queue),
)
qaRouter.get(
  '/me/stats',
  requireAuth,
  requireRole('staff:qa_reviewer', 'staff:admin'),
  asyncHandler(controller.myStats),
)
qaRouter.get(
  '/me/decisions',
  requireAuth,
  requireRole('staff:qa_reviewer', 'staff:admin'),
  asyncHandler(controller.myDecisions),
)
qaRouter.post(
  '/items/:submissionId/decision',
  requireAuth,
  requireRole('staff:qa_reviewer', 'staff:admin'),
  asyncHandler(controller.decide),
)
