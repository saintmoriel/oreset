import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import { requireModule } from '../../middleware/modules'
import * as controller from './tickets.controller'

// Mounted at /api/v1/admin/tickets — the real destination for an
// operator's Escalate decision. Reviewer Lead gets access here (ticket
// triage is their natural "Oversight" domain per the marketing site's own
// OPERATOR_STAGES), unlike datasets which stays admin-only.
export const ticketsRouter = Router()

ticketsRouter.get(
  '/',
  requireAuth,
  requireModule('escalations'),
  asyncHandler(controller.list),
)
ticketsRouter.post(
  '/:id/resolve',
  requireAuth,
  requireModule('escalations'),
  asyncHandler(controller.resolve),
)
