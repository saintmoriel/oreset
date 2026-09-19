import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import { requireModule } from '../../middleware/modules'
import * as controller from './calibration.controller'

export const calibrationRouter = Router()

// Admin: manage gold-standard cases
calibrationRouter.post(
  '/cases',
  requireAuth,
  requireModule('calibration'),
  asyncHandler(controller.createCase),
)

calibrationRouter.get(
  '/cases',
  requireAuth,
  requireModule('calibration'),
  asyncHandler(controller.listCases),
)

calibrationRouter.post(
  '/cases/:id/retire',
  requireAuth,
  requireModule('calibration'),
  asyncHandler(controller.retireCase),
)

calibrationRouter.get(
  '/stats',
  requireAuth,
  requireModule('calibration'),
  asyncHandler(controller.stats),
)

// Operator: calibration rounds
calibrationRouter.get(
  '/next',
  requireAuth,
  requireRole('operator'),
  asyncHandler(controller.nextCase),
)

calibrationRouter.post(
  '/attempt',
  requireAuth,
  requireRole('operator'),
  asyncHandler(controller.submitAttempt),
)

calibrationRouter.get(
  '/my',
  requireAuth,
  requireRole('operator'),
  asyncHandler(controller.myCalibration),
)
