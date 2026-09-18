import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import * as controller from './leads.controller'

// Mounted at /api/v1/leads. Public: the two site forms post here.
export const leadsRouter = Router()
leadsRouter.post('/', asyncHandler(controller.create))

// Mounted at /api/v1/admin/leads. The inbox.
export const leadsAdminRouter = Router()
leadsAdminRouter.get('/', requireAuth, requireRole('staff:admin'), asyncHandler(controller.list))
leadsAdminRouter.patch('/:id', requireAuth, requireRole('staff:admin'), asyncHandler(controller.update))
