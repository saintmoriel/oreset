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

const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim())

export const app = express()

app.use(helmet())
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

app.use((req, res) => {
  res.status(404).json({ error: { code: 'not_found', message: `No route for ${req.method} ${req.path}` } })
})

// Must be registered last.
app.use(errorHandler)
