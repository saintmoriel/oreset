import { Lock, GitCompare, CheckCheck, XCircle, Gavel, TrendingUp, BarChart3, AlertTriangle } from 'lucide-react'
import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'
import type { ConsensusStats, ConsensusPair } from '@/lib/api/endpoints/consensus'
import { AdjudicationQueue } from '@/components/admin/adjudication-queue'

export default async function AdminConsensusPage() {
  const { user } = await serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me')
  const role = user.staffRole!
  const canView = role === 'admin' || role === 'reviewer_lead'

  const [stats, adjudicationRes] = canView
    ? await Promise.all([
        serverApiFetch<ConsensusStats>('/api/v1/consensus/stats'),
        serverApiFetch<{ pairs: ConsensusPair[] }>('/api/v1/consensus/adjudication'),
      ])
    : [null, null]

  return (
    <AdminAppShell>
      <p className="cx-label text-navy-400">Quality Assurance &middot; Inter-Rater Reliability</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Consensus &amp; Dual-Solve</h1>
      <p className="cx-body mt-2 max-w-lg text-navy-500">
        Two independent reviewers evaluate the same case. Agreements resolve automatically.
        Disagreements route here for adjudication.
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
          {/* Stats row */}
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
                <GitCompare className="size-5 text-accent" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">
                  {stats?.totalPairs ?? 0}
                </p>
                <p className="cx-meta text-navy-400">Total Pairs</p>
              </div>
            </div>
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCheck className="size-5 text-success" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">
                  {stats?.rawAgreementRate != null ? `${stats.rawAgreementRate}%` : '--'}
                </p>
                <p className="cx-meta text-navy-400">Agreement Rate</p>
              </div>
            </div>
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
                <BarChart3 className="size-5 text-accent" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">
                  {stats?.cohensKappa != null ? stats.cohensKappa.toFixed(2) : '--'}
                </p>
                <p className="cx-meta text-navy-400">Cohen&apos;s Kappa</p>
              </div>
            </div>
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="size-5 text-destructive" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">
                  {stats?.pendingAdjudication ?? 0}
                </p>
                <p className="cx-meta text-navy-400">Pending Adjudication</p>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="cx-card p-4">
              <div className="flex items-center gap-2">
                <CheckCheck className="size-4 text-success" />
                <p className="cx-meta font-semibold text-navy-500">Agreed</p>
              </div>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-navy-900">
                {stats?.agreedCount ?? 0}
              </p>
            </div>
            <div className="cx-card p-4">
              <div className="flex items-center gap-2">
                <XCircle className="size-4 text-destructive" />
                <p className="cx-meta font-semibold text-navy-500">Disagreed</p>
              </div>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-navy-900">
                {stats?.disagreedCount ?? 0}
              </p>
            </div>
            <div className="cx-card p-4">
              <div className="flex items-center gap-2">
                <Gavel className="size-4 text-accent" />
                <p className="cx-meta font-semibold text-navy-500">Adjudicated</p>
              </div>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-navy-900">
                {stats?.adjudicatedCount ?? 0}
              </p>
            </div>
          </div>

          {/* Kappa interpretation */}
          {stats?.cohensKappa != null && (
            <div className="mt-4 cx-card p-4">
              <p className="cx-meta font-semibold text-navy-500 mb-1">Kappa Interpretation</p>
              <p className="cx-body text-navy-700">
                {stats.cohensKappa < 0
                  ? 'Less than chance agreement. Review reviewer training and guidelines.'
                  : stats.cohensKappa < 0.21
                    ? 'Slight agreement. Significant variability between reviewers.'
                    : stats.cohensKappa < 0.41
                      ? 'Fair agreement. Some consistency, but room for improvement.'
                      : stats.cohensKappa < 0.61
                        ? 'Moderate agreement. Acceptable for most purposes.'
                        : stats.cohensKappa < 0.81
                          ? 'Substantial agreement. Strong inter-rater reliability.'
                          : 'Almost perfect agreement. Excellent inter-rater reliability.'}
              </p>
            </div>
          )}

          {/* Adjudication queue */}
          <AdjudicationQueue initialPairs={adjudicationRes?.pairs ?? []} />
        </>
      )}
    </AdminAppShell>
  )
}
