import { describe, it, expect } from 'vitest'
import { eq } from 'drizzle-orm'
import { db } from '../src/db/client'
import { otpCodes, sessions } from '../src/db/schema'
import { requestOtp, verifyOtp, refreshSession } from '../src/modules/auth/auth.service'
import { HttpError } from '../src/middleware/error-handler'

const PHONE = '+2348000000099'

describe('auth.service', () => {
  it('rejects a wrong OTP code and increments attemptCount', async () => {
    await requestOtp(PHONE)

    await expect(verifyOtp(PHONE, '000000', {})).rejects.toMatchObject({
      status: 400,
      code: 'invalid_code',
    })

    const record = await db.query.otpCodes.findFirst({ where: eq(otpCodes.phone, PHONE) })
    expect(record?.attemptCount).toBe(1)
  })

  it('rotates sessions on refresh: old session revoked, new session live', async () => {
    const { devCode } = await requestOtp(PHONE)
    const { refreshToken: firstRefreshToken, user } = await verifyOtp(PHONE, devCode!, {})

    await refreshSession(firstRefreshToken, {})

    const rows = await db.query.sessions.findMany({ where: eq(sessions.userId, user.id) })
    expect(rows).toHaveLength(2)
    expect(rows.filter((r) => r.revokedAt !== null)).toHaveLength(1)
    expect(rows.filter((r) => r.revokedAt === null)).toHaveLength(1)
  })

  it('rejects reusing an already-rotated refresh token', async () => {
    const { devCode } = await requestOtp(PHONE)
    const { refreshToken: firstRefreshToken } = await verifyOtp(PHONE, devCode!, {})

    await refreshSession(firstRefreshToken, {})

    await expect(refreshSession(firstRefreshToken, {})).rejects.toBeInstanceOf(HttpError)
  })
})
