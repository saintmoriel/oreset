import { Lock, FlaskConical, Ban, CheckCircle2, Download } from 'lucide-react'
import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'
import type { RegressionStats } from '@/lib/api/endpoints/regressions'
import { RegressionExplorer } from '@/components/admin/regression-explorer'

export default async function RegressionsPage() {
  const { user } = await serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me')
  const role = user.staffRole!
  const canView = role === 'admin' || role === 'reviewer_lead'

  const stats = canView
    ? await serverApiFetch<RegressionStats>('/api/v1/admin/regressions/stats')
    : null

  return (
    <AdminAppShell>
      <p className="cx-label text-navy-400">CI/CD · Quality Assurance</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Regression Test Suite</h1>
      <p className="cx-body mt-2 max-w-lg text-navy-500">
        Auto-generated test cases from rejected and corrected operator decisions.
        Export as JSON or JSONL for CI/CD pipeline integration.
      </p>

      {!canView ? (
        <div className="cx-card mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-navy-100">
            <Lock className="size-5 text-navy-400" />
          </span>
          <p className="cx-body font-semibold text-navy-900">Access restricted</p>
          <p className="cx-meta max-w-sm text-navy-500">
            Admin and Reviewer Lead roles only.
          </p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
                <FlaskConical className="size-5 text-accent" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">
                  {stats?.totalTestCases ?? 0}
                </p>
                <p className="cx-meta text-navy-400">Total Cases</p>
              </div>
            </div>
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
                <Ban className="size-5 text-destructive" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">
                  {stats?.rejectedCount ?? 0}
                </p>
                <p className="cx-meta text-navy-400">Rejected</p>
              </div>
            </div>
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle2 className="size-5 text-success" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">
                  {stats?.correctedCount ?? 0}
                </p>
                <p className="cx-meta text-navy-400">Corrected</p>
              </div>
            </div>
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-navy-100">
                <Download className="size-5 text-navy-500" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">
                  {stats?.clients?.length ?? 0}
                </p>
                <p className="cx-meta text-navy-400">Clients</p>
              </div>
            </div>
          </div>

          <RegressionExplorer clients={stats?.clients ?? []} />
        </>
      )}
    </AdminAppShell>
  )
}
