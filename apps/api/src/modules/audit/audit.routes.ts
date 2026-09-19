import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireModule } from '../../middleware/modules'
import * as controller from './audit.controller'

export const auditRouter = Router()

// Read-only — no write route is ever exposed for the audit log. Gated to
// the two roles the /admin prototype's Audit Log screen already reserves
// this for (Admin, Compliance) — Reviewer Lead is rejected here for real,
// not just hidden client-side.
auditRouter.get('/', requireAuth, requireModule('audit'), asyncHandler(controller.list))
