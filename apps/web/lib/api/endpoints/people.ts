import type { RoleType, StaffRole, UserStatus } from '@oreset/shared'
import { apiFetch } from '../client'

export type Person = {
  id: string
  role: RoleType
  staffRole: StaffRole | null
  accessKey: string
  accessLabel: string
  twoFactor: boolean
  modules: string[] | null
  grants: { id: string; module: string; reason: string; expiresAt: string | null }[] | null
  email: string | null
  phone: string | null
  displayName: string | null
  operatorCode: string | null
  status: UserStatus
  lastLoginAt: string | null
  createdAt: string
  agreementsSigned: number | null
  verification: 'verified' | 'pending' | 'rejected' | 'none' | null
  location: string | null
  languages: string[]
}

export type RoleAccess = Record<string, { label: string; portal: string; reaches: string[] }>

export type Client = {
  id: string
  email: string | null
  displayName: string | null
  status: UserStatus
  agentName: string | null
  scenariosTotal: number
  scenariosInProgress: number
  findingsOpen: number
  findingsInRetest: number
  findingsClosed: number
  pendingVerification: number
  resilienceScore: number
  resilienceLabel: string
  paid: { currency: string; paidMinorUnits: number }[]
  lastActivityAt: string | null
  lastLoginAt: string | null
  createdAt: string
}

export type BusinessNumbers = {
  clientsActive: number
  testersActive: number
  engagementsRunning: number
  revenue30d: { currency: string; minorUnits: number }[]
}

export function listPeople() {
  return apiFetch<{ users: Person[]; roles: RoleAccess }>('/api/v1/admin/people')
}

export function createStaff(input: { email: string; displayName: string; staffRole: StaffRole }) {
  return apiFetch<{ user: { id: string; email: string | null; displayName: string | null; staffRole: StaffRole | null }; temporaryPassword: string }>(
    '/api/v1/admin/staff',
    { method: 'POST', body: input },
  )
}

export function updateUser(id: string, input: { status?: 'active' | 'suspended'; staffRole?: StaffRole; displayName?: string }) {
  return apiFetch<{ user: Person }>(`/api/v1/admin/users/${id}`, { method: 'PATCH', body: input })
}

export function resetUserPassword(id: string) {
  return apiFetch<{ temporaryPassword: string }>(`/api/v1/admin/users/${id}/reset-password`, { method: 'POST' })
}

export function listClients() {
  return apiFetch<{ clients: Client[] }>('/api/v1/admin/clients')
}

export function provisionClient(input: { email: string; password: string; displayName: string }) {
  return apiFetch<{ user: { id: string; email: string | null; displayName: string | null } }>('/api/v1/admin/buyers', {
    method: 'POST',
    body: input,
  })
}

export function formatMoney(minorUnits: number, currency: string) {
  const major = minorUnits / 100
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(major)
  } catch {
    return `${currency} ${major.toLocaleString()}`
  }
}
