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

export function applyAsOperator(input: ApplyAsOperatorInput) {
  return apiFetch<{ user: AuthUser }>('/api/v1/operators/apply', { method: 'POST', body: input })
}

export function certifyOperator() {
  return apiFetch<{ user: AuthUser }>('/api/v1/operators/certify', { method: 'POST' })
}

export function listOperatorApplications() {
  return apiFetch<{ applications: OperatorApplication[] }>('/api/v1/admin/operators/applications')
}
