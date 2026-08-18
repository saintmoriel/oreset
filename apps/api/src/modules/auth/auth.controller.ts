import type { Request, Response } from 'express'
import { z } from 'zod'
import * as authService from './auth.service'
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  accessCookieOptions,
  refreshCookieOptions,
  clearedCookieOptions,
} from '../../config/cookies'

const otpRequestSchema = z.object({ phone: z.string().min(8) })
const otpVerifySchema = z.object({ phone: z.string().min(8), code: z.string().length(6) })
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })

function setSessionCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions())
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions())
}

function requestContext(req: Request) {
  return { userAgent: req.get('user-agent') ?? undefined, ip: req.ip }
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
  const { user, accessToken, refreshToken } = await authService.loginWithPassword(
    email,
    password,
    requestContext(req),
  )
  setSessionCookies(res, accessToken, refreshToken)
  res.status(200).json({ user })
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
