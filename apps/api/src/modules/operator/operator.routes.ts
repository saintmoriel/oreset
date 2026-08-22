import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import { requireActive } from '../../middleware/require-active'
import * as controller from './operator.controller'

export const operatorRouter = Router()

operatorRouter.get(
  '/queue',
  requireAuth,
  requireRole('operator'),
  requireActive,
  asyncHandler(controller.queue),
)
operatorRouter.post(
  '/items/:id/decision',
  requireAuth,
  requireRole('operator'),
  requireActive,
  asyncHandler(controller.decide),
)
