import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import * as controller from './me.controller'

// Mounted at /api/v1/me. Every route here operates on req.user.sub only —
// no id param exists to spoof another user's data.
export const meRouter = Router()

meRouter.get('/data-export', requireAuth, asyncHandler(controller.dataExport))
meRouter.get('/consent-records', requireAuth, asyncHandler(controller.consentRecords))
meRouter.post('/delete-account', requireAuth, asyncHandler(controller.deleteAccount))
