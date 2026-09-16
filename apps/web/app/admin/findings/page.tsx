import { Lock, ShieldAlert, CheckCircle2, XCircle, Scale } from 'lucide-react'
import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { FindingsVerificationQueue } from '@/components/admin/findings-verification-queue'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'
import type { VerificationQueueEntry, VerificationStats } from '@/lib/api/endpoints/findings'

export default async function AdminFindingsPage() {
  const { user } = await serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me')
  const role = user.staffRole!
  const canView = role === 'admin' || role === 'reviewer_lead'

  let findings: VerificationQueueEntry[] = []
  let stats: VerificationStats | null = null
  if (canView) {
    ;[{ findings }, stats] = await Promise.all([
      serverApiFetch<{ findings: VerificationQueueEntry[] }>('/api/v1/findings/queue'),
      serverApiFetch<VerificationStats>('/api/v1/findings/stats'),
    ])
  }

  return (
    <AdminAppShell>
      <p className="cx-label text-navy-400">Lead Auditor · Verification</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Findings</h1>
      <p className="cx-body mt-2 max-w-lg text-navy-500">
        Every confirmed P0 or P1 exploit and every escalation lands here before the client sees it.
        Reproduce it, judge the blast radius, then verify, adjust the severity, or reject it as a false positive.
      </p>

      {!canView ? (
        <div className="cx-card mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-navy-100">
            <Lock className="size-5 text-navy-400" />
          </span>
          <p className="cx-body font-semibold text-navy-900">Access restricted</p>
          <p className="cx-meta max-w-sm text-navy-500">Admin and Lead Auditor roles only.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-warning/10">
                <ShieldAlert className="size-5 text-warning" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">{stats?.pendingVerification ?? 0}</p>
                <p className="cx-meta text-navy-400">Awaiting verification</p>
              </div>
            </div>
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle2 className="size-5 text-success" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">{stats?.byVerdict.verified ?? 0}</p>
                <p className="cx-meta text-navy-400">Verified</p>
              </div>
            </div>
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
                <Scale className="size-5 text-accent" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">{stats?.byVerdict.severity_adjusted ?? 0}</p>
                <p className="cx-meta text-navy-400">Severity adjusted</p>
              </div>
            </div>
            <div className="cx-card flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-lg bg-navy-100">
                <XCircle className="size-5 text-navy-500" />
              </span>
              <div>
                <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">
                  {stats?.byVerdict.false_positive ?? 0}
                  {stats?.falsePositiveRate != null && (
                    <span className="ml-1.5 cx-meta font-sans font-normal text-navy-400">({stats.falsePositiveRate}%)</span>
                  )}
                </p>
                <p className="cx-meta text-navy-400">False positives</p>
              </div>
            </div>
          </div>

          <FindingsVerificationQueue initial={findings} />
        </>
      )}
    </AdminAppShell>
  )
}
