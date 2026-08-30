import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import * as controller from './consensus.controller'

export const consensusRouter = Router()

consensusRouter.get(
  '/stats',
  requireAuth,
  requireRole('staff:admin', 'staff:reviewer_lead'),
  asyncHandler(controller.stats),
)
consensusRouter.get(
  '/adjudication',
  requireAuth,
  requireRole('staff:admin', 'staff:reviewer_lead'),
  asyncHandler(controller.adjudicationQueue),
)
consensusRouter.get(
  '/pairs',
  requireAuth,
  requireRole('staff:admin', 'staff:reviewer_lead'),
  asyncHandler(controller.listPairs),
)
consensusRouter.post(
  '/pairs/:id/adjudicate',
  requireAuth,
  requireRole('staff:admin', 'staff:reviewer_lead'),
  asyncHandler(controller.adjudicate),
)
consensusRouter.post(
  '/items/:id/enable',
  requireAuth,
  requireRole('staff:admin', 'staff:reviewer_lead'),
  asyncHandler(controller.enableDualSolve),
)
consensusRouter.post(
  '/enable-all',
  requireAuth,
  requireRole('staff:admin'),
  asyncHandler(controller.enableDualSolveBulk),
)
