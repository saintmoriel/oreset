import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import * as controller from './admin.controller'
import * as peopleController from './people.controller'

export const adminRouter = Router()

// Owner's console: accounts, access, clients. Admin only.
const adminOnly = requireRole('staff:admin')
adminRouter.get('/people', requireAuth, adminOnly, asyncHandler(peopleController.list))
adminRouter.post('/staff', requireAuth, adminOnly, asyncHandler(peopleController.createStaff))
adminRouter.patch('/users/:id', requireAuth, adminOnly, asyncHandler(peopleController.updateUser))
adminRouter.post('/users/:id/reset-password', requireAuth, adminOnly, asyncHandler(peopleController.resetPassword))
adminRouter.get('/clients', requireAuth, adminOnly, asyncHandler(peopleController.clients))

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
