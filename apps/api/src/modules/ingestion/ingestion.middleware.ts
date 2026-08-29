import type { Request, Response, NextFunction } from 'express'
import { HttpError } from '../../middleware/error-handler'

export function requireApiKey(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new HttpError(401, 'unauthorized', 'Missing or invalid API key.')
  }

  const key = authHeader.slice(7)
  const validKeys = (process.env.API_KEYS ?? '').split(',').map((k) => k.trim()).filter(Boolean)

  if (validKeys.length === 0 || !validKeys.includes(key)) {
    throw new HttpError(401, 'unauthorized', 'Invalid API key.')
  }

  next()
}
