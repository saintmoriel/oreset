import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import * as controller from './campaigns.controller'

export const campaignsRouter = Router()

campaignsRouter.get('/', requireAuth, requireRole('staff:admin'), asyncHandler(controller.list))
campaignsRouter.post('/', requireAuth, requireRole('staff:admin'), asyncHandler(controller.create))
