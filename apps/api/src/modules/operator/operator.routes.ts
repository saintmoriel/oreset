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
operatorRouter.get(
  '/me/stats',
  requireAuth,
  requireRole('operator'),
  requireActive,
  asyncHandler(controller.myStats),
)
operatorRouter.get(
  '/me/decisions',
  requireAuth,
  requireRole('operator'),
  requireActive,
  asyncHandler(controller.myDecisions),
)
operatorRouter.post(
  '/items/:id/decision',
  requireAuth,
  requireRole('operator'),
  requireActive,
  asyncHandler(controller.decide),
)
operatorRouter.get(
  '/me/profile',
  requireAuth,
  requireRole('operator'),
  asyncHandler(controller.getProfile),
)
operatorRouter.patch(
  '/me/profile',
  requireAuth,
  requireRole('operator'),
  asyncHandler(controller.updateProfile),
)
