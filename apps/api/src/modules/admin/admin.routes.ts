import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import * as controller from './admin.controller'

export const adminRouter = Router()

adminRouter.get(
  '/overview',
  requireAuth,
  requireRole('staff:admin', 'staff:compliance', 'staff:reviewer_lead'),
  asyncHandler(controller.overview),
)

adminRouter.get(
  '/regressions',
  requireAuth,
  requireRole('staff:admin', 'staff:reviewer_lead'),
  asyncHandler(controller.regressionSuite),
)

adminRouter.get(
  '/regressions/stats',
  requireAuth,
  requireRole('staff:admin', 'staff:reviewer_lead'),
  asyncHandler(controller.regressionStats),
)

adminRouter.get(
  '/operators/performance',
  requireAuth,
  requireRole('staff:admin', 'staff:reviewer_lead'),
  asyncHandler(controller.operatorPerformance),
)
