import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import * as controller from './datasets.controller'

// Mounted at /api/v1/admin/datasets — Assembly/Provenance Seal/Handoff,
// admin-only (Origin business function, unlike ticket triage which is
// Reviewer Lead's domain).
export const datasetsRouter = Router()

datasetsRouter.get('/', requireAuth, requireRole('staff:admin'), asyncHandler(controller.list))
datasetsRouter.post('/', requireAuth, requireRole('staff:admin'), asyncHandler(controller.create))
datasetsRouter.get('/:id', requireAuth, requireRole('staff:admin'), asyncHandler(controller.get))
datasetsRouter.get(
  '/:id/unassembled',
  requireAuth,
  requireRole('staff:admin'),
  asyncHandler(controller.unassembled),
)
datasetsRouter.post('/:id/items', requireAuth, requireRole('staff:admin'), asyncHandler(controller.addItems))
datasetsRouter.delete(
  '/:id/items/:submissionId',
  requireAuth,
  requireRole('staff:admin'),
  asyncHandler(controller.removeItem),
)
datasetsRouter.post('/:id/seal', requireAuth, requireRole('staff:admin'), asyncHandler(controller.seal))
datasetsRouter.post('/:id/handoff', requireAuth, requireRole('staff:admin'), asyncHandler(controller.handoff))
