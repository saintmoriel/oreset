import { Lock } from 'lucide-react'
import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { PayoutsAdminClient } from '@/components/admin/payouts-admin-client'
import { StatusTag } from '@/components/capture/status-tag'
import { VerificationSeal } from '@/components/capture/verification-seal'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'
import type { AdminPayout } from '@/lib/api/endpoints/payouts'

export default async function AdminPayoutsPage() {
  const { user } = await serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me')
  const role = user.staffRole!
  const canManage = role === 'admin'

  const payouts = canManage
    ? (await serverApiFetch<{ payouts: AdminPayout[] }>('/api/v1/admin/payouts')).payouts
    : []

  return (
    <AdminAppShell>
      <p className="cx-label text-navy-400">Compliance &amp; payments</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Payouts &amp; retention</h1>
      <p className="cx-body mt-2 max-w-lg text-navy-500">
        Run a payout batch to pay contributors for approved submissions, or trigger a retention
        sweep to purge media past the retention window.
      </p>

      {!canManage ? (
        <div className="cx-card mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-navy-100">
            <Lock className="size-5 text-navy-400" />
          </span>
          <p className="cx-body font-semibold text-navy-900">Access restricted</p>
          <p className="cx-meta max-w-sm text-navy-500">
            Your role cannot run payout or retention batches. Admin only.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <PayoutsAdminClient />
          </div>

          <div className="mt-8">
            <p className="cx-label text-navy-400">Recent payouts</p>
            {payouts.length === 0 ? (
              <p className="cx-body mt-2.5 text-navy-400">No payouts have been run yet.</p>
            ) : (
              <div className="cx-card mt-2.5 divide-y divide-border">
                {payouts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="cx-body font-medium text-navy-900">
                        {p.contributor.displayName ?? p.contributor.phone ?? 'Contributor'}
                      </p>
                      <p className="cx-mono-meta text-navy-400">{new Date(p.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-body font-semibold tabular-nums text-navy-900">
                        {(p.amountMinorUnits / 100).toLocaleString(undefined, {
                          style: 'currency',
                          currency: p.currency,
                        })}
                      </p>
                      {p.status === 'paid' ? (
                        <VerificationSeal label="Paid" />
                      ) : (
                        <StatusTag tone={p.status === 'failed' ? 'destructive' : 'warning'}>{p.status}</StatusTag>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AdminAppShell>
  )
}
