import type { AuthUser } from '@oreset/shared'
import { apiFetch } from '../client'

export function requestOtp(phone: string) {
  return apiFetch<{ devCode?: string }>('/api/v1/auth/otp/request', { method: 'POST', body: { phone } })
}

export function verifyOtp(phone: string, code: string) {
  return apiFetch<{ user: AuthUser }>('/api/v1/auth/otp/verify', { method: 'POST', body: { phone, code } })
}

export function login(email: string, password: string) {
  return apiFetch<{ user: AuthUser }>('/api/v1/auth/login', { method: 'POST', body: { email, password } })
}

export function logout() {
  return apiFetch<{ ok: true }>('/api/v1/auth/logout', { method: 'POST' })
}

export function getMe() {
  return apiFetch<{ user: AuthUser }>('/api/v1/auth/me')
}
