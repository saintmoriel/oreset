import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import * as controller from './tickets.controller'

// Mounted at /api/v1/admin/tickets — the real destination for an
// operator's Escalate decision. Reviewer Lead gets access here (ticket
// triage is their natural "Oversight" domain per the marketing site's own
// OPERATOR_STAGES), unlike datasets which stays admin-only.
export const ticketsRouter = Router()

ticketsRouter.get(
  '/',
  requireAuth,
  requireRole('staff:admin', 'staff:reviewer_lead'),
  asyncHandler(controller.list),
)
ticketsRouter.post(
  '/:id/resolve',
  requireAuth,
  requireRole('staff:admin', 'staff:reviewer_lead'),
  asyncHandler(controller.resolve),
)
