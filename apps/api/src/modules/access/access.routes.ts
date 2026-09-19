import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth, sessionOnly } from '../../middleware/auth'
import { requireModule, requireStaff } from '../../middleware/modules'
import * as controller from './access.controller'

// Mounted under /api/v1/admin/access.
export const accessRouter = Router()

// Any staff member: what I hold, what I can ask for, my requests.
accessRouter.get('/me', requireAuth, requireStaff, asyncHandler(controller.me))
accessRouter.post('/requests', requireAuth, sessionOnly, requireStaff, asyncHandler(controller.request))

// Approvers: anyone holding the People module.
const approvers = requireModule('people')
accessRouter.get('/pending', requireAuth, approvers, asyncHandler(controller.pending))
accessRouter.post('/requests/:id/decide', requireAuth, sessionOnly, approvers, asyncHandler(controller.decide))
accessRouter.post('/grants', requireAuth, sessionOnly, approvers, asyncHandler(controller.grant))
accessRouter.delete('/grants/:id', requireAuth, sessionOnly, approvers, asyncHandler(controller.revoke))
