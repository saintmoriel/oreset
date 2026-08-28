import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { isProduction } from '../config/env'

export class HttpError extends Error {
  status: number
  code: string
  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: { code: 'validation_error', message: 'Invalid request.', details: err.flatten() },
    })
    return
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } })
    return
  }

  console.error(err)
  const devMessage =
    typeof err?.message === 'string' && err.message.length > 0
      ? err.message
      : (err?.type ?? err?.constructor?.name ?? String(err))
  res.status(500).json({
    error: {
      code: 'internal_error',
      message: isProduction ? 'Something went wrong.' : devMessage,
    },
  })
}
