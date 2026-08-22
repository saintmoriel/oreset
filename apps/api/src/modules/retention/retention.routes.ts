import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import * as controller from './retention.controller'

// Mounted at /api/v1/admin/retention. A real, manually-triggerable,
// testable endpoint — production wires an external cron (Railway cron
// job, GitHub Actions schedule) to call it periodically. No in-process
// timer here; that wouldn't survive a multi-instance deployment cleanly.
export const retentionRouter = Router()

retentionRouter.post('/run', requireAuth, requireRole('staff:admin'), asyncHandler(controller.run))
