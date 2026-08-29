import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireApiKey } from './ingestion.middleware'
import * as controller from './ingestion.controller'

export const ingestionRouter = Router()

// POST /api/v1/ingest — single trace unit
ingestionRouter.post('/', requireApiKey, asyncHandler(controller.ingest))

// POST /api/v1/ingest/batch — batch of trace units (max 100)
ingestionRouter.post('/batch', requireApiKey, asyncHandler(controller.ingestBatch))

// GET /api/v1/ingest/status/:id — check status of a submitted item
ingestionRouter.get('/status/:id', requireApiKey, asyncHandler(controller.getStatus))

// GET /api/v1/ingest/regressions — export CI/CD regression test suite
// Query params: ?client=Name&since=2026-01-01&limit=100&format=json|jsonl
ingestionRouter.get('/regressions', requireApiKey, asyncHandler(controller.regressionSuite))

// GET /api/v1/ingest/regressions/stats — regression suite statistics
ingestionRouter.get('/regressions/stats', requireApiKey, asyncHandler(controller.regressionStats))
