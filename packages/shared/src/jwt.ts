import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import type { AccessTokenClaims } from './types'

// Shared between apps/api (signs + verifies) and apps/web/middleware.ts
// (verifies only, running on the Next.js Edge runtime — which is why this
// uses `jose` rather than `jsonwebtoken`: jsonwebtoken depends on Node's
// `crypto` module and does not run on Edge).

function getSecret(secret: string) {
  return new TextEncoder().encode(secret)
}

export async function signAccessToken(
  claims: AccessTokenClaims,
  secret: string,
  expiresIn: string = '15m',
): Promise<string> {
  return new SignJWT({ ...claims } as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret(secret))
}

export async function verifyAccessToken(
  token: string,
  secret: string,
): Promise<AccessTokenClaims> {
  const { payload } = await jwtVerify(token, getSecret(secret))
  return payload as unknown as AccessTokenClaims
}

export async function signRefreshToken(
  sessionId: string,
  secret: string,
  expiresIn: string = '30d',
): Promise<string> {
  return new SignJWT({ sid: sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret(secret))
}

export async function verifyRefreshToken(
  token: string,
  secret: string,
): Promise<{ sid: string }> {
  const { payload } = await jwtVerify(token, getSecret(secret))
  return payload as unknown as { sid: string }
}
