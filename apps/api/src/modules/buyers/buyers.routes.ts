import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import * as controller from './buyers.controller'

// Mounted at /api/v1/buyer — buyer self-view, own data only (req.user.sub,
// no id param to spoof).
export const buyersRouter = Router()

buyersRouter.get('/datasets', requireAuth, requireRole('buyer'), asyncHandler(controller.myDatasets))
buyersRouter.get('/datasets/:id', requireAuth, requireRole('buyer'), asyncHandler(controller.myDatasetDetail))

// Mounted at /api/v1/admin/buyers — admin provisioning + the handoff picker.
export const buyersAdminRouter = Router()

buyersAdminRouter.post('/', requireAuth, requireRole('staff:admin'), asyncHandler(controller.provision))
buyersAdminRouter.get('/', requireAuth, requireRole('staff:admin'), asyncHandler(controller.list))
