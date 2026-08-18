import type { RoleType, StaffRole, UserStatus } from './enums'

// Cookie names must match exactly between apps/api (which sets them) and
// apps/web/middleware.ts (which reads them) — defined once here so they
// can't drift.
export const ACCESS_COOKIE_NAME = 'oreset_at'
export const REFRESH_COOKIE_NAME = 'oreset_rt'

export type AuthUser = {
  id: string
  role: RoleType
  staffRole: StaffRole | null
  displayName: string | null
  status: UserStatus
}

// Claims embedded in the oreset_at access token — kept minimal so the
// Next.js Edge middleware can authorize routes without a DB round trip.
export type AccessTokenClaims = {
  sub: string // user id
  role: RoleType
  staffRole: StaffRole | null
}

export type OtpRequestBody = {
  phone: string
}

export type OtpVerifyBody = {
  phone: string
  code: string
}

export type LoginBody = {
  email: string
  password: string
}

export type ApiErrorBody = {
  error: {
    code: string
    message: string
  }
}
