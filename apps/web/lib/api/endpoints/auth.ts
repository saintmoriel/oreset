import type { AuthUser } from '@oreset/shared'
import { apiFetch } from '../client'

export function requestOtp(phone: string) {
  return apiFetch<{ devCode?: string }>('/api/v1/auth/otp/request', { method: 'POST', body: { phone } })
}

export function verifyOtp(phone: string, code: string) {
  return apiFetch<{ user: AuthUser }>('/api/v1/auth/otp/verify', { method: 'POST', body: { phone, code } })
}

export type LoginResponse = { mfaRequired: false; user: AuthUser } | { mfaRequired: true; mfaToken: string }

export function login(email: string, password: string) {
  return apiFetch<LoginResponse>('/api/v1/auth/login', { method: 'POST', body: { email, password } })
}

export function verifyMfa(mfaToken: string, code: string) {
  return apiFetch<{ mfaRequired: false; user: AuthUser }>('/api/v1/auth/mfa/verify', { method: 'POST', body: { mfaToken, code } })
}

export type MfaStatus = { enabled: boolean; recoveryCodesLeft: number | null; enabledAt: string | null }

export function getMfaStatus() {
  return apiFetch<MfaStatus>('/api/v1/auth/mfa/status')
}

export function startMfaSetup() {
  return apiFetch<{ secret: string; otpauthUrl: string }>('/api/v1/auth/mfa/setup', { method: 'POST' })
}

export function enableMfa(code: string) {
  return apiFetch<{ recoveryCodes: string[] }>('/api/v1/auth/mfa/enable', { method: 'POST', body: { code } })
}

export function disableMfa(code: string, password: string) {
  return apiFetch<void>('/api/v1/auth/mfa/disable', { method: 'POST', body: { code, password } })
}

export function regenerateRecoveryCodes(code: string) {
  return apiFetch<{ recoveryCodes: string[] }>('/api/v1/auth/mfa/recovery-codes', { method: 'POST', body: { code } })
}

export function logout() {
  return apiFetch<{ ok: true }>('/api/v1/auth/logout', { method: 'POST' })
}

export function getMe() {
  return apiFetch<{ user: AuthUser }>('/api/v1/auth/me')
}

export function forgotPassword(email: string) {
  return apiFetch<{ ok: true }>('/api/v1/auth/password/forgot', { method: 'POST', body: { email } })
}

export function resetPassword(token: string, password: string) {
  return apiFetch<{ portalPath: string }>('/api/v1/auth/password/reset', { method: 'POST', body: { token, password } })
}
