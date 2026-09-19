import type { AuthUser, UserStatus } from '@oreset/shared'
import { apiFetch } from '../client'

export type LanguageRow = { language: string; fluency: string }

export type SecurityExperienceYears = 'none' | 'under_2' | '2_to_5' | 'over_5'

export const EXPERIENCE_LABELS: Record<SecurityExperienceYears, string> = {
  none: 'No professional security testing yet',
  under_2: 'Under 2 years',
  '2_to_5': '2 to 5 years',
  over_5: 'Over 5 years',
}

export type OperatorApplication = {
  id: string
  location: string
  languages: LanguageRow[]
  securityExperienceYears: SecurityExperienceYears | null
  experience: string | null
  aiRedTeamExposure: string | null
  tools: string | null
  workSample: string | null
  portfolioUrl: string | null
  availability: string[] | null
  dialect: string | null
  academicBackground: string | null
  englishProficiency: string | null
  createdAt: string
  user: {
    id: string
    displayName: string | null
    email: string | null
    operatorCode: string | null
    status: UserStatus
  }
}

export type ApplyAsOperatorInput = {
  name: string
  email: string
  phone: string
  password: string
  location: string
  languages: LanguageRow[]
  securityExperienceYears: SecurityExperienceYears
  experience: string
  aiRedTeamExposure?: string
  tools?: string
  workSample: string
  portfolioUrl?: string
  availability?: string[]
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
