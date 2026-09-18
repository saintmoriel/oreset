import type { Request, Response, NextFunction } from 'express'
import { createHash } from 'node:crypto'
import { and, eq, isNull } from 'drizzle-orm'
import { verifyAccessToken } from '@oreset/shared'
import { env } from '../config/env'
import { ACCESS_COOKIE_NAME } from '../config/cookies'
import { db } from '../db/client'
import { apiTokens, users } from '../db/schema'

// Two ways in: the browser session cookie (everything), or a client API
// token in the Authorization header (read-only, buyer routes only). A token
// that leaks from a CI log can pull the regression suite and nothing else.

export const TOKEN_PREFIX = 'ort_'

const TOKEN_ALLOWED_PATHS = [
  '/api/v1/buyer/regressions',
  '/api/v1/buyer/cases/export',
  '/api/v1/buyer/cases',
  '/api/v1/buyer/findings',
]

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

async function authenticateApiToken(req: Request, res: Response): Promise<boolean> {
  const header = req.get('authorization')
  if (!header?.startsWith('Bearer ')) return false
  const token = header.slice(7).trim()
  if (!token.startsWith(TOKEN_PREFIX)) {
    res.status(401).json({ error: { code: 'invalid_token', message: 'Invalid API token.' } })
    return true
  }

  const record = await db.query.apiTokens.findFirst({
    where: and(eq(apiTokens.tokenHash, hashToken(token)), isNull(apiTokens.revokedAt)),
  })
  if (!record || (record.expiresAt && record.expiresAt < new Date())) {
    res.status(401).json({ error: { code: 'invalid_token', message: 'Invalid or revoked API token.' } })
    return true
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, record.userId) })
  if (!user || user.status !== 'active' || user.role !== 'buyer') {
    res.status(401).json({ error: { code: 'invalid_token', message: 'Invalid or revoked API token.' } })
    return true
  }

  const readOnly = req.method === 'GET' || req.method === 'HEAD'
  const allowed = TOKEN_ALLOWED_PATHS.some((p) => req.originalUrl.split('?')[0].startsWith(p))
  if (!readOnly || !allowed) {
    res.status(403).json({
      error: { code: 'token_scope', message: 'API tokens can only read scenarios, findings, and regression exports. Sign in for anything else.' },
    })
    return true
  }

  req.user = { sub: user.id, role: user.role, staffRole: user.staffRole, status: user.status }
  res.locals.authVia = 'api_token'
  res.locals.apiTokenId = record.id
  void db.update(apiTokens).set({ lastUsedAt: new Date() }).where(eq(apiTokens.id, record.id))
  return false
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.get('authorization')) {
    const handled = await authenticateApiToken(req, res)
    if (handled) return
    if (req.user) {
      next()
      return
    }
  }

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

// For routes that must never be driven by an API token (creating or
// revoking tokens, changing webhooks). Place after requireAuth.
export function sessionOnly(_req: Request, res: Response, next: NextFunction) {
  if (res.locals.authVia === 'api_token') {
    res.status(403).json({ error: { code: 'session_required', message: 'This action requires a signed-in session.' } })
    return
  }
  next()
}
