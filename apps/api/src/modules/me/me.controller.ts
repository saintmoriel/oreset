import type { Request, Response } from 'express'
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@oreset/shared'
import { clearedCookieOptions } from '../../config/cookies'
import * as meService from './me.service'

export async function dataExport(req: Request, res: Response) {
  const bundle = await meService.getDataExport(req.user!.sub)
  res.status(200).json(bundle)
}

export async function consentRecords(req: Request, res: Response) {
  const records = await meService.getConsentRecords(req.user!.sub)
  res.status(200).json({ consentRecords: records })
}

export async function deleteAccount(req: Request, res: Response) {
  await meService.deleteAccount(req.user!.sub)
  // The caller's own session is among those just revoked — clear their
  // cookies too, so the browser doesn't keep sending a dead refresh token.
  res.clearCookie(ACCESS_COOKIE_NAME, clearedCookieOptions('/'))
  res.clearCookie(REFRESH_COOKIE_NAME, clearedCookieOptions('/api/v1/auth/refresh'))
  res.status(200).json({ ok: true })
}
