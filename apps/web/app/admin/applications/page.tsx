import { Lock } from 'lucide-react'
import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { ApplicationsList } from '@/components/admin/applications-list'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'
import type { OperatorApplication } from '@/lib/api/endpoints/operators'

export default async function OperatorApplicationsPage() {
  const { user } = await serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me')
  const role = user.staffRole!
  const canView = role === 'admin' || role === 'reviewer_lead'

  const applications = canView
    ? (await serverApiFetch<{ applications: OperatorApplication[] }>('/api/v1/admin/operators/applications')).applications
    : []

  return (
    <AdminAppShell>
      <p className="cx-label text-navy-400">Red Team · Applications</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Tester applications</h1>
      <p className="cx-body mt-2 max-w-2xl text-navy-500">
        Nobody sees client attack data until a person approves them here. After approval the tester
        still has to sign all three agreements and pass two calibration scenarios before their queue opens.
      </p>

      {!canView ? (
        <div className="cx-card mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-navy-100">
            <Lock className="size-5 text-navy-400" />
          </span>
          <p className="cx-body font-semibold text-navy-900">Admin and lead auditor only</p>
        </div>
      ) : (
        <ApplicationsList initial={applications} />
      )}
    </AdminAppShell>
  )
}
