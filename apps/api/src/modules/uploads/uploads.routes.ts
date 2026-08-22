import { Router } from 'express'
import express from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import * as controller from './uploads.controller'

export const uploadsRouter = Router()

uploadsRouter.post('/', requireAuth, requireRole('contributor'), asyncHandler(controller.presign))

// Express 4 uses path-to-regexp v0.1.x, where :key(.*) — not :key(*) — is
// required to capture a slash-containing tail (contributors/uuid/uuid/uuid.ext)
// as a single param. No requireAuth here: a presigned URL's security is the
// URL itself (an unguessable key), not a cookie — this keeps local dev's
// client-side upload code identical in shape to a real presigned PUT/GET.
uploadsRouter.put(
  '/local/:key(.*)',
  express.raw({ type: '*/*', limit: '25mb' }),
  asyncHandler(controller.putLocal),
)
uploadsRouter.get('/local/:key(.*)', asyncHandler(controller.getLocal))
