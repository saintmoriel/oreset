import { Lock, Users, Activity, Clock, Target } from 'lucide-react'
import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'
import type { OperatorPerformanceResponse } from '@/lib/api/endpoints/operator-performance'
import { OperatorPerformanceTable } from '@/components/admin/operator-performance-table'

export default async function AdminOperatorsPage() {
  const { user } = await serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me')
  const role = user.staffRole!
  const canView = role === 'admin' || role === 'reviewer_lead'

  const data = canView
    ? await serverApiFetch<OperatorPerformanceResponse>('/api/v1/admin/operators/performance')
    : null

  return (
    <AdminAppShell>
      <p className="cx-label text-navy-400">Workforce &middot; Reviewer Metrics</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Operator Performance</h1>
      <p className="cx-body mt-2 max-w-lg text-navy-500">
        Per-operator metrics: review volume, speed, decision patterns, calibration scores,
        and consensus agreement rates.
      </p>

      {!canView ? (
        <div className="cx-card mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-navy-100">
            <Lock className="size-5 text-navy-400" />
          </span>
          <p className="cx-body font-semibold text-navy-900">Access restricted</p>
          <p className="cx-meta max-w-sm text-navy-500">Admin and Reviewer Lead roles only.</p>
        </div>
      ) : data ? (
        <>
          {/* Global stats */}
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
                <Users className="size-5 text-accent" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">
                  {data.globalStats.activeOperators}
                  <span className="cx-meta font-normal text-navy-400"> / {data.globalStats.totalOperators}</span>
                </p>
                <p className="cx-meta text-navy-400">Active Operators</p>
              </div>
            </div>
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-navy-100">
                <Activity className="size-5 text-navy-500" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">
                  {data.globalStats.totalReviews}
                </p>
                <p className="cx-meta text-navy-400">Total Reviews</p>
              </div>
            </div>
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-success/10">
                <Target className="size-5 text-success" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">
                  {data.globalStats.totalCalibrationAttempts}
                </p>
                <p className="cx-meta text-navy-400">Calibration Attempts</p>
              </div>
            </div>
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
                <Clock className="size-5 text-accent" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">
                  {data.globalStats.avgReviewsPerOperator}
                </p>
                <p className="cx-meta text-navy-400">Avg Reviews / Operator</p>
              </div>
            </div>
          </div>

          <OperatorPerformanceTable operators={data.operators} />
        </>
      ) : null}
    </AdminAppShell>
  )
}
