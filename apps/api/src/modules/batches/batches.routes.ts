import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireAuth } from '../../middleware/auth'
import * as controller from './batches.controller'

export const batchesRouter = Router()

batchesRouter.get('/', requireAuth, asyncHandler(controller.list))
batchesRouter.get('/:id', requireAuth, asyncHandler(controller.getById))
