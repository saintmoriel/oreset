import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import * as controller from './calibration.controller'

export const calibrationRouter = Router()

// Admin: manage gold-standard cases
calibrationRouter.post(
  '/cases',
  requireAuth,
  requireRole('staff:admin', 'staff:reviewer_lead'),
  asyncHandler(controller.createCase),
)

calibrationRouter.get(
  '/cases',
  requireAuth,
  requireRole('staff:admin', 'staff:reviewer_lead'),
  asyncHandler(controller.listCases),
)

calibrationRouter.post(
  '/cases/:id/retire',
  requireAuth,
  requireRole('staff:admin', 'staff:reviewer_lead'),
  asyncHandler(controller.retireCase),
)

calibrationRouter.get(
  '/stats',
  requireAuth,
  requireRole('staff:admin', 'staff:reviewer_lead'),
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
