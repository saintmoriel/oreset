import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import { requireModule } from '../../middleware/modules'
import * as controller from './operators.controller'
import * as applications from './applications.controller'

export const operatorsRouter = Router()

operatorsRouter.post('/apply', asyncHandler(controller.apply))
// Self-certification (POST /certify) was removed: a tester becomes active
// only when an admin or lead auditor approves the application below.

// Mounted at /api/v1/admin/operators
export const operatorsAdminRouter = Router()

const reviewers = requireModule('testers')

operatorsAdminRouter.get('/applications', requireAuth, reviewers, asyncHandler(controller.listApplications))
operatorsAdminRouter.post('/applications/:userId/approve', requireAuth, reviewers, asyncHandler(applications.approve))
operatorsAdminRouter.post('/applications/:userId/reject', requireAuth, reviewers, asyncHandler(applications.reject))
