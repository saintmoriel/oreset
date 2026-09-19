import type { Request, Response } from 'express'
import { z } from 'zod'
import * as authService from './auth.service'
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME, clearedCookieOptions } from '../../config/cookies'
import { setSessionCookies, requestContext } from '../../lib/session-cookies'

const otpRequestSchema = z.object({ phone: z.string().min(8) })
const otpVerifySchema = z.object({ phone: z.string().min(8), code: z.string().length(6) })
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })
const forgotSchema = z.object({ email: z.string().trim().email() })
const resetSchema = z.object({ token: z.string().min(20).max(200), password: z.string().min(8).max(200) })

// Public endpoints: small per-IP limit so nobody can spray reset emails.
const forgotHits = new Map<string, { count: number; windowStart: number }>()
function limitForgot(ip: string) {
  const now = Date.now()
  const e = forgotHits.get(ip)
  if (!e || now - e.windowStart > 15 * 60_000) {
    forgotHits.set(ip, { count: 1, windowStart: now })
    return true
  }
  e.count += 1
  return e.count <= 5
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = forgotSchema.parse(req.body)
  if (limitForgot(req.ip ?? 'unknown')) {
    await authService.requestPasswordReset(email, req.ip)
  }
  // Same answer whether or not the account exists.
  res.status(200).json({ ok: true })
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = resetSchema.parse(req.body)
  const result = await authService.resetPasswordWithToken(token, password)
  res.status(200).json(result)
}

export async function requestOtp(req: Request, res: Response) {
  const { phone } = otpRequestSchema.parse(req.body)
  const result = await authService.requestOtp(phone)
  res.status(200).json(result)
}

export async function verifyOtp(req: Request, res: Response) {
  const { phone, code } = otpVerifySchema.parse(req.body)
  const { user, accessToken, refreshToken } = await authService.verifyOtp(phone, code, requestContext(req))
  setSessionCookies(res, accessToken, refreshToken)
  res.status(200).json({ user })
}

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body)
  const result = await authService.loginWithPassword(email, password, requestContext(req))
  if (result.mfaRequired) {
    // Password accepted; the client now asks for the authenticator code.
    res.status(200).json({ mfaRequired: true, mfaToken: result.mfaToken })
    return
  }
  setSessionCookies(res, result.accessToken, result.refreshToken)
  res.status(200).json({ mfaRequired: false, user: result.user })
}

const mfaVerifySchema = z.object({ mfaToken: z.string().min(10), code: z.string().trim().min(6).max(20) })
const codeSchema = z.object({ code: z.string().trim().min(6).max(20) })
const disableSchema = z.object({ code: z.string().trim().min(6).max(20), password: z.string().min(1) })

export async function mfaVerify(req: Request, res: Response) {
  const { mfaToken, code } = mfaVerifySchema.parse(req.body)
  const result = await authService.completeMfaLogin(mfaToken, code, requestContext(req))
  setSessionCookies(res, result.accessToken, result.refreshToken)
  res.status(200).json({ mfaRequired: false, user: result.user })
}

export async function mfaStatus(req: Request, res: Response) {
  res.json(await authService.mfaStatus(req.user!.sub))
}

export async function mfaSetup(req: Request, res: Response) {
  res.json(await authService.beginMfaSetup(req.user!.sub))
}

export async function mfaEnable(req: Request, res: Response) {
  const { code } = codeSchema.parse(req.body)
  res.json(await authService.enableMfa(req.user!.sub, code))
}

export async function mfaDisable(req: Request, res: Response) {
  const { code, password } = disableSchema.parse(req.body)
  await authService.disableMfa(req.user!.sub, code, password)
  res.status(204).end()
}

export async function mfaRecoveryCodes(req: Request, res: Response) {
  const { code } = codeSchema.parse(req.body)
  res.json(await authService.regenerateRecoveryCodes(req.user!.sub, code))
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]
  if (!refreshToken) {
    res.status(401).json({ error: { code: 'unauthenticated', message: 'No session to refresh.' } })
    return
  }
  const { user, accessToken, refreshToken: newRefreshToken } = await authService.refreshSession(
    refreshToken,
    requestContext(req),
  )
  setSessionCookies(res, accessToken, newRefreshToken)
  res.status(200).json({ user })
}

export async function logout(req: Request, res: Response) {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]
  await authService.logout(refreshToken)
  res.clearCookie(ACCESS_COOKIE_NAME, clearedCookieOptions('/'))
  res.clearCookie(REFRESH_COOKIE_NAME, clearedCookieOptions('/api/v1/auth/refresh'))
  res.status(200).json({ ok: true })
}

export async function me(req: Request, res: Response) {
  const user = await authService.getUserById(req.user!.sub)
  if (!user) {
    res.status(401).json({ error: { code: 'unauthenticated', message: 'Sign-in required.' } })
    return
  }
  res.status(200).json({ user })
}
