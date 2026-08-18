import type { CookieOptions } from 'express'
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@oreset/shared'
import { env, isProduction } from './env'

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000 // 15 minutes
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export const ACCESS_TOKEN_TTL = '15m'
export const REFRESH_TOKEN_TTL = '30d'

export { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME }

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  // Subdomains of the same registrable domain (app.oreset.com / api.oreset.com)
  // are same-site, so Lax is sufficient without SameSite=None's extra
  // requirements (which would force Secure even in local dev).
  sameSite: 'lax',
  domain: env.COOKIE_DOMAIN,
}

export function accessCookieOptions(): CookieOptions {
  return { ...baseCookieOptions, path: '/', maxAge: ACCESS_TOKEN_TTL_MS }
}

export function refreshCookieOptions(): CookieOptions {
  // Scoped to the refresh route only, to limit blast radius if the cookie leaks.
  return { ...baseCookieOptions, path: '/api/v1/auth/refresh', maxAge: REFRESH_TOKEN_TTL_MS }
}

export function clearedCookieOptions(path: string): CookieOptions {
  return { ...baseCookieOptions, path, maxAge: 0 }
}
