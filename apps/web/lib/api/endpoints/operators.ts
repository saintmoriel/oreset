import type { AuthUser, UserStatus } from '@oreset/shared'
import { apiFetch } from '../client'

export type OperatorApplication = {
  id: string
  location: string
  languages: LanguageRow[]
  dialect: string | null
  academicBackground: string
  englishProficiency: string
  availability: string[] | null
  experience: string | null
  createdAt: string
  user: {
    id: string
    displayName: string | null
    email: string | null
    operatorCode: string | null
    status: UserStatus
  }
}

export type LanguageRow = { language: string; fluency: string }

export type ApplyAsOperatorInput = {
  name: string
  email: string
  phone: string
  password: string
  location: string
  languages: LanguageRow[]
  dialect?: string
  academicBackground: string
  englishProficiency: string
  availability?: string[]
  experience?: string
}

export type OnboardingStatus = {
  agreementsSigned: number
  agreementsRequired: number
  calibrationPassed: number
  calibrationRequired: number
  complete: boolean
}

export function applyAsOperator(input: ApplyAsOperatorInput) {
  return apiFetch<{ user: AuthUser }>('/api/v1/operators/apply', { method: 'POST', body: input })
}

export function getMyOnboarding() {
  return apiFetch<OnboardingStatus>('/api/v1/operator/me/onboarding')
}

export function listOperatorApplications() {
  return apiFetch<{ applications: OperatorApplication[] }>('/api/v1/admin/operators/applications')
}

export function approveApplication(userId: string) {
  return apiFetch<{ user: { id: string; status: UserStatus } }>(`/api/v1/admin/operators/applications/${userId}/approve`, { method: 'POST' })
}

export function rejectApplication(userId: string, reason?: string) {
  return apiFetch<{ user: { id: string; status: UserStatus } }>(`/api/v1/admin/operators/applications/${userId}/reject`, {
    method: 'POST',
    body: { reason },
  })
}
