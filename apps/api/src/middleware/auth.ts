import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '@oreset/shared'
import { env } from '../config/env'
import { ACCESS_COOKIE_NAME } from '../config/cookies'

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[ACCESS_COOKIE_NAME]
  if (!token) {
    res.status(401).json({ error: { code: 'unauthenticated', message: 'Sign-in required.' } })
    return
  }

  try {
    req.user = await verifyAccessToken(token, env.ACCESS_TOKEN_SECRET)
    next()
  } catch {
    res.status(401).json({ error: { code: 'unauthenticated', message: 'Session expired or invalid.' } })
  }
}
