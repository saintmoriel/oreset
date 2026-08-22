import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env'
import { requestLogger } from './middleware/request-logger'
import { errorHandler } from './middleware/error-handler'
import { authRouter } from './modules/auth/auth.routes'
import { batchesRouter } from './modules/batches/batches.routes'
import { consentRouter } from './modules/consent/consent.routes'
import { submissionsRouter } from './modules/submissions/submissions.routes'
import { auditRouter } from './modules/audit/audit.routes'
import { uploadsRouter } from './modules/uploads/uploads.routes'
import { qaRouter } from './modules/qa/qa.routes'
import { campaignsRouter } from './modules/campaigns/campaigns.routes'
import { promptsRouter } from './modules/prompts/prompts.routes'
import { operatorsRouter } from './modules/operators/operators.routes'
import { operatorRouter } from './modules/operator/operator.routes'
import { retentionRouter } from './modules/retention/retention.routes'
import { payoutsRouter, payoutsAdminRouter } from './modules/payouts/payouts.routes'
import { meRouter } from './modules/me/me.routes'
import { datasetsRouter } from './modules/datasets/datasets.routes'
import { buyersRouter, buyersAdminRouter } from './modules/buyers/buyers.routes'
import { ticketsRouter } from './modules/tickets/tickets.routes'

const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim())

export const app = express()

// crossOriginResourcePolicy defaults to 'same-origin', which would make
// browsers silently refuse to load <audio>/<img> media served from this
// API (e.g. /uploads/local/*) when embedded in a page from apps/web's
// different origin. This API is meant to serve media cross-origin.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(cookieParser())
app.use(express.json())
app.use(requestLogger)

app.get('/health', (_req, res) => res.status(200).json({ ok: true }))

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/batches', batchesRouter)
app.use('/api/v1/consent', consentRouter)
app.use('/api/v1/submissions', submissionsRouter)
app.use('/api/v1/audit', auditRouter)
app.use('/api/v1/uploads', uploadsRouter)
app.use('/api/v1/qa', qaRouter)
app.use('/api/v1/campaigns', campaignsRouter)
app.use('/api/v1/prompts', promptsRouter)
app.use('/api/v1/operators', operatorsRouter)
app.use('/api/v1/operator', operatorRouter)
app.use('/api/v1/payouts', payoutsRouter)
app.use('/api/v1/me', meRouter)
app.use('/api/v1/admin/retention', retentionRouter)
app.use('/api/v1/admin/payouts', payoutsAdminRouter)
app.use('/api/v1/buyer', buyersRouter)
app.use('/api/v1/admin/buyers', buyersAdminRouter)
app.use('/api/v1/admin/datasets', datasetsRouter)
app.use('/api/v1/admin/tickets', ticketsRouter)

app.use((req, res) => {
  res.status(404).json({ error: { code: 'not_found', message: `No route for ${req.method} ${req.path}` } })
})

// Must be registered last.
app.use(errorHandler)
