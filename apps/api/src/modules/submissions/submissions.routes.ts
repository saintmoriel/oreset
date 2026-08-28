import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import * as controller from './submissions.controller'

export const submissionsRouter = Router()

submissionsRouter.post('/', requireAuth, requireRole('contributor'), asyncHandler(controller.create))
submissionsRouter.get('/me', requireAuth, requireRole('contributor'), asyncHandler(controller.listMine))
