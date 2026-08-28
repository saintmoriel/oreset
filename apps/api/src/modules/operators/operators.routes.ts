import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import * as controller from './operators.controller'

export const operatorsRouter = Router()

operatorsRouter.post('/apply', asyncHandler(controller.apply))
// Deliberately no requireActive here — this IS the gate that lets a
// still-pending operator become active.
operatorsRouter.post('/certify', requireAuth, requireRole('operator'), asyncHandler(controller.certify))

// Mounted at /api/v1/admin/operators — admin visibility into applications,
// same dual-router-export shape buyers.routes.ts already established.
export const operatorsAdminRouter = Router()

operatorsAdminRouter.get(
  '/applications',
  requireAuth,
  requireRole('staff:admin'),
  asyncHandler(controller.listApplications),
)
