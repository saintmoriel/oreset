import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import * as controller from './buyers.controller'

// Mounted at /api/v1/buyer — buyer self-view, own data only (req.user.sub,
// no id param to spoof).
export const buyersRouter = Router()

buyersRouter.get('/datasets', requireAuth, requireRole('buyer'), asyncHandler(controller.myDatasets))
buyersRouter.get('/datasets/:id', requireAuth, requireRole('buyer'), asyncHandler(controller.myDatasetDetail))
buyersRouter.get('/me/stats', requireAuth, requireRole('buyer'), asyncHandler(controller.myStats))
buyersRouter.get('/me/downloads', requireAuth, requireRole('buyer'), asyncHandler(controller.myDownloads))
buyersRouter.get(
  '/datasets/:id/items/:itemId/download',
  requireAuth,
  requireRole('buyer'),
  asyncHandler(controller.downloadItem),
)

// Verification Cases
buyersRouter.post('/cases', requireAuth, requireRole('buyer'), asyncHandler(controller.submitCase))
buyersRouter.post('/cases/batch', requireAuth, requireRole('buyer'), asyncHandler(controller.submitCasesBatch))
buyersRouter.get('/cases/export', requireAuth, requireRole('buyer'), asyncHandler(controller.exportCases))
buyersRouter.get('/cases', requireAuth, requireRole('buyer'), asyncHandler(controller.myCases))
buyersRouter.get('/cases/stats', requireAuth, requireRole('buyer'), asyncHandler(controller.myCaseStats))
buyersRouter.get('/cases/:id', requireAuth, requireRole('buyer'), asyncHandler(controller.myCaseDetail))
buyersRouter.get('/regressions', requireAuth, requireRole('buyer'), asyncHandler(controller.myRegressions))

// Webhooks
buyersRouter.get('/webhooks', requireAuth, requireRole('buyer'), asyncHandler(controller.listWebhooks))
buyersRouter.post('/webhooks', requireAuth, requireRole('buyer'), asyncHandler(controller.createWebhook))
buyersRouter.patch('/webhooks/:id', requireAuth, requireRole('buyer'), asyncHandler(controller.updateWebhook))
buyersRouter.delete('/webhooks/:id', requireAuth, requireRole('buyer'), asyncHandler(controller.deleteWebhook))
buyersRouter.post('/webhooks/:id/rotate', requireAuth, requireRole('buyer'), asyncHandler(controller.rotateWebhookSecret))

// Mounted at /api/v1/admin/buyers — admin provisioning + the handoff picker.
export const buyersAdminRouter = Router()

buyersAdminRouter.post('/', requireAuth, requireRole('staff:admin'), asyncHandler(controller.provision))
buyersAdminRouter.get('/', requireAuth, requireRole('staff:admin'), asyncHandler(controller.list))
