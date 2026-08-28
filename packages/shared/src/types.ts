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
  operatorCode: string | null
  // Contributor-only; null for every other role. Presence (not shape)
  // is what /capture/home uses to decide whether to show the payout
  // details form.
  payoutDetails: Record<string, unknown> | null
  phone: string | null
  // Staff/operator-only; null for contributors (who sign in by phone).
  email: string | null
  // ISO timestamp string.
  createdAt: string
}

// Claims embedded in the oreset_at access token — kept minimal so the
// Next.js Edge middleware can authorize routes without a DB round trip.
// status is here specifically so proxy.ts can enforce the Foundry/Certify
// gate (operator must be status='active') without a DB round trip either.
export type AccessTokenClaims = {
  sub: string // user id
  role: RoleType
  staffRole: StaffRole | null
  status: UserStatus
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
