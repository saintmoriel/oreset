import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import { CaptureAppShell } from '@/components/capture/capture-app-shell'
import { PayoutDetailsForm } from '@/components/capture/payout-details-form'
import { StatusTag } from '@/components/capture/status-tag'
import { VerificationSeal } from '@/components/capture/verification-seal'
import { formatRate, daysAgo, sameMonth } from '@/lib/capture-format'
import type { Payout } from '@/lib/api/endpoints/payouts'
import type { SubmissionSummary } from '@/lib/api/endpoints/submissions'
import type { AuthUser } from '@oreset/shared'
import type { PayoutStatus } from '@oreset/shared'

const PAYOUT_STATUS_TONE: Record<PayoutStatus, 'success' | 'warning' | 'destructive' | 'neutral'> = {
  paid: 'success',
  pending: 'neutral',
  processing: 'warning',
  failed: 'destructive',
}

export default async function CapturePayoutsPage() {
  let payouts: Payout[]
  let user: AuthUser
  let submissions: SubmissionSummary[]
  try {
    ;[{ payouts }, { user }, { submissions }] = await Promise.all([
      serverApiFetch<{ payouts: Payout[] }>('/api/v1/payouts/me'),
      serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me'),
      serverApiFetch<{ submissions: SubmissionSummary[] }>('/api/v1/submissions/me'),
    ])
  } catch (err) {
    redirectIfSignedOut(err, '/capture')
  }
  const paid = payouts.filter((p) => p.status === 'paid')
  const totalPaidMinorUnits = paid.reduce((sum, p) => sum + p.amountMinorUnits, 0)
  const currency = payouts[0]?.currency ?? 'NGN'
  const now = new Date()
  const thisWeekPaid = paid.filter((p) => daysAgo(p.createdAt) <= 7).reduce((sum, p) => sum + p.amountMinorUnits, 0)
  const thisMonthPaid = paid.filter((p) => sameMonth(p.createdAt, now)).reduce((sum, p) => sum + p.amountMinorUnits, 0)

  const earnedByBatch = new Map<string, { title: string; currency: string; total: number; count: number }>()
  for (const s of submissions) {
    if (s.status !== 'qa_approved') continue
    const entry = earnedByBatch.get(s.batch.id) ?? { title: s.batch.title, currency: s.batch.currency, total: 0, count: 0 }
    entry.total += s.batch.rateMinorUnits
    entry.count += 1
    earnedByBatch.set(s.batch.id, entry)
  }
  const earnedRows = Array.from(earnedByBatch.values())

  return (
    <CaptureAppShell>
      <p className="cx-label text-navy-400">Money</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Payouts</h1>

      <div className="cx-card mt-6 grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="cx-meta text-navy-400">Total paid out</p>
          <p className="cx-stat mt-1 text-navy-900">{formatRate(totalPaidMinorUnits, currency)}</p>
        </div>
        <div className="p-5">
          <p className="cx-meta text-navy-400">This week</p>
          <p className="cx-stat mt-1 text-navy-900">{formatRate(thisWeekPaid, currency)}</p>
        </div>
        <div className="p-5">
          <p className="cx-meta text-navy-400">This month</p>
          <p className="cx-stat mt-1 text-navy-900">{formatRate(thisMonthPaid, currency)}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3 lg:items-start">
        <div>
          <p className="cx-title text-navy-900">Payout details</p>
          <PayoutDetailsForm hasDetailsOnFile={Boolean(user.payoutDetails)} />
          <p className="cx-meta mt-2 text-navy-400">
            Payouts are issued manually when an admin runs a batch — there&apos;s no fixed schedule to
            estimate from.
          </p>
          <p className="cx-meta mt-4 text-navy-400">
            Something wrong with a payout?{' '}
            <a
              href="mailto:hello@oreset.africa?subject=Payout%20issue"
              className="font-medium text-accent hover:underline"
            >
              Contact support
            </a>
          </p>
        </div>

        <div>
          <p className="cx-label text-navy-400">Earned by batch</p>
          <p className="cx-meta mt-0.5 text-navy-400">
            Approved submissions not yet included in a payout run still count here.
          </p>
          {earnedRows.length === 0 ? (
            <p className="cx-body mt-2.5 text-navy-400">Nothing approved yet.</p>
          ) : (
            <div className="cx-card mt-2.5 divide-y divide-border">
              {earnedRows.map((row) => (
                <div key={row.title} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="cx-body font-medium text-navy-900">{row.title}</p>
                    <p className="cx-meta text-navy-400">
                      {row.count} submission{row.count === 1 ? '' : 's'} approved
                    </p>
                  </div>
                  <span className="cx-body font-mono font-semibold tabular-nums text-navy-800">
                    {formatRate(row.total, row.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="cx-label text-navy-400">History</p>
          {payouts.length === 0 ? (
            <p className="cx-body mt-2.5 text-navy-400">No payouts yet.</p>
          ) : (
            <div className="cx-card mt-2.5 divide-y divide-border">
              {payouts.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="cx-body font-mono font-medium tabular-nums text-navy-900">
                      {formatRate(p.amountMinorUnits, p.currency)}
                    </p>
                    <p className="cx-mono-meta text-navy-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  {p.status === 'paid' ? (
                    <VerificationSeal label="Paid" />
                  ) : (
                    <StatusTag tone={PAYOUT_STATUS_TONE[p.status]}>{p.status}</StatusTag>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CaptureAppShell>
  )
}
