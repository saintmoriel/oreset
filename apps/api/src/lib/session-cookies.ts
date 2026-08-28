import type { Request, Response } from 'express'
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME, accessCookieOptions, refreshCookieOptions } from '../config/cookies'

// Shared by any controller that issues a session (auth.controller.ts's
// login/verify/refresh, and operators.controller.ts's certify, which needs
// to re-issue fresh cookies immediately after a status change) — factored
// out so cookie-issuing logic exists in exactly one place.
export function setSessionCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions())
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions())
}

export function requestContext(req: Request) {
  return { userAgent: req.get('user-agent') ?? undefined, ip: req.ip }
}
