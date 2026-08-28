import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import * as controller from './payouts.controller'

// Mounted at /api/v1/payouts — contributor self-service, own data only
// (req.user.sub, no id param to spoof).
export const payoutsRouter = Router()

payoutsRouter.get('/me', requireAuth, requireRole('contributor'), asyncHandler(controller.myPayouts))
payoutsRouter.post(
  '/me/details',
  requireAuth,
  requireRole('contributor'),
  asyncHandler(controller.setMyPayoutDetails),
)

// Mounted at /api/v1/admin/payouts — admin-triggered batch operation,
// same operational shape as retention.routes.ts.
export const payoutsAdminRouter = Router()

payoutsAdminRouter.post('/run', requireAuth, requireRole('staff:admin'), asyncHandler(controller.runBatch))
payoutsAdminRouter.get('/', requireAuth, requireRole('staff:admin'), asyncHandler(controller.listAll))
