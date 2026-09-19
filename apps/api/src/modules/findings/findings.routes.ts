import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import { requireModule } from '../../middleware/modules'
import * as controller from './findings.controller'

// Mounted at /api/v1/findings. Lead auditor verification of tester findings.
export const findingsRouter = Router()

const auditors = requireModule('findings')

findingsRouter.get('/queue', requireAuth, auditors, asyncHandler(controller.queue))
findingsRouter.get('/stats', requireAuth, auditors, asyncHandler(controller.stats))
findingsRouter.get('/:decisionId', requireAuth, auditors, asyncHandler(controller.detail))
findingsRouter.post('/:decisionId/verify', requireAuth, auditors, asyncHandler(controller.verify))
