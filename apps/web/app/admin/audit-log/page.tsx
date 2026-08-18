'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Lock } from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { AUDIT_LOG, ROLES, type RoleId } from '@/lib/admin-mock-data'

function AuditLogContent() {
  const params = useSearchParams()
  const role = (ROLES.find((r) => r.id === params.get('role'))?.id ?? 'admin') as RoleId
  const roleInfo = ROLES.find((r) => r.id === role) ?? ROLES[0]

  return (
    <AdminShell role={role}>
      <div>
        <p className="text-eyebrow text-accent">Auditability</p>
        <h1 className="text-h2 mt-2 text-foreground">System event log</h1>
        <p className="text-body-sm mt-1 text-muted-foreground">
          Immutable record of consent, screening, review, and RBAC events.
        </p>

        {!roleInfo.canViewAuditLog ? (
          <div className="card-surface mt-6 flex flex-col items-center gap-3 p-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <Lock className="size-5 text-muted-foreground" />
            </span>
            <p className="text-body font-semibold text-foreground">Access restricted</p>
            <p className="text-body-sm max-w-sm text-muted-foreground">
              The <strong className="font-medium text-foreground">{roleInfo.label}</strong> role
              does not have audit log permissions. Switch to Admin or Compliance Officer to view
              this page.
            </p>
          </div>
        ) : (
          <div className="card-surface mt-6 overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead>
                <tr className="border-b border-border/70 text-caption text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Actor</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Resource</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {AUDIT_LOG.map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 tabular text-muted-foreground">{row.time}</td>
                    <td className="px-4 py-3 font-mono text-foreground">{row.actor}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.role}</td>
                    <td className="px-4 py-3 font-mono text-foreground">{row.action}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{row.resource}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  )
}

export default function AuditLogPage() {
  return (
    <Suspense>
      <AuditLogContent />
    </Suspense>
  )
}
