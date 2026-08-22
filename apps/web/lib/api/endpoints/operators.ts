import type { AuthUser } from '@oreset/shared'
import { apiFetch } from '../client'

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
