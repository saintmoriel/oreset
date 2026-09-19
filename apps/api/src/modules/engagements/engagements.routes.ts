import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth, sessionOnly } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import { requireModule } from '../../middleware/modules'
import { requireActive } from '../../middleware/require-active'
import * as controller from './engagements.controller'

// /api/v1/admin/engagements. Owner and Client Success (the Clients module).
export const engagementsAdminRouter = Router()
const clients = requireModule('clients')
engagementsAdminRouter.get('/', requireAuth, clients, asyncHandler(controller.listForBuyer))
engagementsAdminRouter.post('/', requireAuth, sessionOnly, clients, asyncHandler(controller.create))
engagementsAdminRouter.patch('/:id', requireAuth, sessionOnly, clients, asyncHandler(controller.update))

// /api/v1/buyer/engagements. The client's own engagements only.
export const engagementsBuyerRouter = Router()
engagementsBuyerRouter.get('/', requireAuth, requireRole('buyer'), asyncHandler(controller.mine))

// /api/v1/operator/engagements. Rules of Engagement and acknowledgement.
export const engagementsOperatorRouter = Router()
engagementsOperatorRouter.get('/:id', requireAuth, requireRole('operator'), requireActive, asyncHandler(controller.rules))
engagementsOperatorRouter.post('/:id/acknowledge', requireAuth, sessionOnly, requireRole('operator'), requireActive, asyncHandler(controller.acknowledge))
