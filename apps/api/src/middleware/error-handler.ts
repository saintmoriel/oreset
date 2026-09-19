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
    const flat = err.flatten()
    const fields = Object.keys(flat.fieldErrors)
    // Name the fields so a person (or a log line) can see what to change.
    const message = fields.length
      ? `Some answers could not be accepted: ${fields.join(', ')}.`
      : 'The request was not in the expected shape.'
    res.status(400).json({ error: { code: 'validation_error', message, details: flat } })
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
