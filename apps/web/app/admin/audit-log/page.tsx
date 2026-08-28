import { Lock } from 'lucide-react'
import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { AuditLogClient } from '@/components/admin/audit-log-client'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'
import type { AuditLogEntry } from '@/lib/api/endpoints/audit'

export default async function AuditLogPage() {
  const { user } = await serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me')
  const role = user.staffRole!
  const canView = role === 'admin' || role === 'compliance'

  const entries = canView
    ? (await serverApiFetch<{ entries: AuditLogEntry[] }>('/api/v1/audit')).entries
    : []

  return (
    <AdminAppShell>
      <p className="cx-label text-navy-400">Auditability</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">System event log</h1>
      <p className="cx-body mt-2 max-w-lg text-navy-500">
        Immutable record of consent, screening, review, and RBAC events.
      </p>

      {!canView ? (
        <div className="cx-card mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-navy-100">
            <Lock className="size-5 text-navy-400" />
          </span>
          <p className="cx-body font-semibold text-navy-900">Access restricted</p>
          <p className="cx-meta max-w-sm text-navy-500">
            Your role does not have audit log permissions. Admin or Compliance Officer only.
          </p>
        </div>
      ) : (
        <AuditLogClient entries={entries} />
      )}
    </AdminAppShell>
  )
}
