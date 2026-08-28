import Link from 'next/link'
import { ArrowLeft, Lock } from 'lucide-react'
import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { StatusTag } from '@/components/capture/status-tag'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'
import type { OperatorApplication } from '@/lib/api/endpoints/operators'

export default async function OperatorApplicationsPage() {
  const { user } = await serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me')
  const role = user.staffRole!
  const canView = role === 'admin'

  const applications = canView
    ? (await serverApiFetch<{ applications: OperatorApplication[] }>('/api/v1/admin/operators/applications'))
        .applications
    : []

  return (
    <AdminAppShell>
      <Link href="/admin/home" className="inline-flex items-center gap-1.5 cx-meta font-medium text-navy-500 hover:text-navy-800">
        <ArrowLeft className="size-4" />
        Home
      </Link>

      <p className="cx-label mt-6 text-navy-400">Operators · Applicants</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Applications</h1>
      <p className="cx-body mt-2 max-w-lg text-navy-500">
        Certification itself stays self-service (the Foundry quiz) — this is real visibility into
        who has applied and their current status.
      </p>

      {!canView ? (
        <div className="cx-card mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-navy-100">
            <Lock className="size-5 text-navy-400" />
          </span>
          <p className="cx-body font-semibold text-navy-900">Access restricted</p>
          <p className="cx-meta max-w-sm text-navy-500">Your role cannot view operator applications. Admin only.</p>
        </div>
      ) : applications.length === 0 ? (
        <p className="cx-body mt-6 text-navy-400">No applications yet.</p>
      ) : (
        <div className="cx-card mt-6 divide-y divide-border">
          {applications.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="cx-body font-medium text-navy-900">{a.user.displayName ?? a.user.email}</p>
                <p className="cx-mono-meta mt-0.5 text-navy-400">
                  {a.user.operatorCode} · {a.location} · {a.academicBackground}
                </p>
                <p className="cx-meta mt-1 text-navy-500">
                  {a.languages.map((l) => `${l.language} (${l.fluency})`).join(', ')}
                </p>
              </div>
              <StatusTag tone={a.user.status === 'active' ? 'success' : 'neutral'}>
                {a.user.status === 'active' ? 'Certified' : 'Pending'}
              </StatusTag>
            </div>
          ))}
        </div>
      )}
    </AdminAppShell>
  )
}
