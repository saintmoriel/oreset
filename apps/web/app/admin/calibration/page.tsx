import { Lock, Target, Users, Award, TrendingUp } from 'lucide-react'
import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'
import type { CalibrationStats, CalibrationCaseFull } from '@/lib/api/endpoints/calibration'
import { CalibrationManager } from '@/components/admin/calibration-manager'

export default async function AdminCalibrationPage() {
  const { user } = await serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me')
  const role = user.staffRole!
  const canView = role === 'admin' || role === 'reviewer_lead'

  const [stats, casesRes] = canView
    ? await Promise.all([
        serverApiFetch<CalibrationStats>('/api/v1/calibration/stats'),
        serverApiFetch<{ cases: CalibrationCaseFull[] }>('/api/v1/calibration/cases'),
      ])
    : [null, null]

  return (
    <AdminAppShell>
      <p className="cx-label text-navy-400">Quality Assurance · Inter-Rater Reliability</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Calibration</h1>
      <p className="cx-body mt-2 max-w-lg text-navy-500">
        Manage gold-standard cases and track operator calibration scores.
        Cases are served to operators as practice rounds with instant feedback.
      </p>

      {!canView ? (
        <div className="cx-card mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-navy-100">
            <Lock className="size-5 text-navy-400" />
          </span>
          <p className="cx-body font-semibold text-navy-900">Access restricted</p>
          <p className="cx-meta max-w-sm text-navy-500">Admin and Reviewer Lead roles only.</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
                <Target className="size-5 text-accent" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">
                  {stats?.activeCases ?? 0}
                </p>
                <p className="cx-meta text-navy-400">Active Cases</p>
              </div>
            </div>
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-navy-100">
                <Users className="size-5 text-navy-500" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">
                  {stats?.totalAttempts ?? 0}
                </p>
                <p className="cx-meta text-navy-400">Total Attempts</p>
              </div>
            </div>
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-success/10">
                <Award className="size-5 text-success" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">
                  {stats?.overallPassRate != null ? `${stats.overallPassRate}%` : '—'}
                </p>
                <p className="cx-meta text-navy-400">Pass Rate</p>
              </div>
            </div>
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
                <TrendingUp className="size-5 text-accent" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">
                  {stats?.avgScore != null ? `${stats.avgScore}%` : '—'}
                </p>
                <p className="cx-meta text-navy-400">Avg Score</p>
              </div>
            </div>
          </div>

          {/* Operator leaderboard */}
          {stats?.operatorStats && stats.operatorStats.length > 0 && (
            <div className="mt-6">
              <h2 className="cx-title text-navy-900 mb-3">Operator Performance</h2>
              <div className="cx-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-navy-50/50">
                      <th className="px-4 py-2.5 text-left cx-meta font-semibold text-navy-500">Operator</th>
                      <th className="px-4 py-2.5 text-right cx-meta font-semibold text-navy-500">Attempts</th>
                      <th className="px-4 py-2.5 text-right cx-meta font-semibold text-navy-500">Passed</th>
                      <th className="px-4 py-2.5 text-right cx-meta font-semibold text-navy-500">Pass Rate</th>
                      <th className="px-4 py-2.5 text-right cx-meta font-semibold text-navy-500">Avg Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.operatorStats.map((op) => (
                      <tr key={op.operatorId} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-2.5 cx-mono-meta text-navy-800">{op.operatorId.slice(0, 8)}…</td>
                        <td className="px-4 py-2.5 text-right cx-mono-meta text-navy-700">{op.attempts}</td>
                        <td className="px-4 py-2.5 text-right cx-mono-meta text-navy-700">{op.passed}</td>
                        <td className="px-4 py-2.5 text-right cx-mono-meta font-semibold text-navy-800">{op.passRate}%</td>
                        <td className="px-4 py-2.5 text-right cx-mono-meta text-navy-700">{op.avgScore}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <CalibrationManager initialCases={casesRes?.cases ?? []} />
        </>
      )}
    </AdminAppShell>
  )
}
