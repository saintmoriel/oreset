import Link from 'next/link'
import { ArrowRight, ListChecks, TriangleAlert } from 'lucide-react'
import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import { OperatorAppShell } from '@/components/operator/operator-app-shell'
import { StatusTag } from '@/components/capture/status-tag'
import { VerificationSeal } from '@/components/capture/verification-seal'
import { ERR_TAG_LABELS } from '@oreset/shared'
import type { OperatorStats, OperatorDecisionRecord } from '@/lib/api/endpoints/operator'

export default async function OperatorHomePage() {
  let stats: OperatorStats
  let decisions: OperatorDecisionRecord[]
  try {
    ;[stats, { decisions }] = await Promise.all([
      serverApiFetch<OperatorStats>('/api/v1/operator/me/stats'),
      serverApiFetch<{ decisions: OperatorDecisionRecord[] }>('/api/v1/operator/me/decisions'),
    ])
  } catch (err) {
    redirectIfSignedOut(err, '/operator')
  }

  const recent = decisions.slice(0, 5)

  return (
    <OperatorAppShell>
      <p className="cx-label text-navy-400">Welcome back</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Home</h1>

      <div className="mt-6 rounded-xl border border-navy-900 bg-navy-900 p-6 sm:p-8">
        <p className="cx-label text-copper-300">Reviewed today</p>
        <p className="mt-2 font-mono text-4xl font-semibold tracking-tight tabular-nums text-white sm:text-5xl">
          {stats.reviewedToday}
        </p>
      </div>

      {stats.openTicketsFromMe > 0 && (
        <div className="cx-card mt-6 flex items-center gap-3 border-warning/30 bg-warning/5 p-4">
          <TriangleAlert className="size-4 shrink-0 text-warning" />
          <p className="cx-body text-navy-500">
            <span className="font-mono font-semibold text-navy-900">{stats.openTicketsFromMe}</span> of your
            escalations {stats.openTicketsFromMe === 1 ? 'is' : 'are'} still open with the client team.
          </p>
        </div>
      )}

      <Link
        href="/operator/queue"
        className="cx-card mt-6 flex items-center justify-between gap-4 border-accent/30 bg-accent/5 p-6 hover:bg-accent/10"
      >
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <ListChecks className="size-6" />
          </span>
          <div>
            <p className="cx-label text-accent">Queue</p>
            <p className="cx-title mt-0.5 text-navy-900">Client placement awaiting review</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="cx-stat text-navy-900">{stats.queueRemaining}</p>
            <p className="cx-meta text-navy-400">remaining</p>
          </div>
          <ArrowRight className="size-5 shrink-0 text-accent" />
        </div>
      </Link>

      <div className="cx-card mt-6 grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="cx-meta text-navy-400">Reviewed all-time</p>
          <p className="cx-stat mt-1 text-navy-900">{stats.reviewedAllTime}</p>
        </div>
        <div className="p-5">
          <p className="cx-meta text-navy-400">Approval rate</p>
          <p className="cx-stat mt-1 text-navy-900">{stats.approvalRate === null ? '—' : `${stats.approvalRate}%`}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div>
          <p className="cx-label text-navy-400">Recent decisions</p>
          {recent.length === 0 ? (
            <p className="cx-body mt-2.5 text-navy-400">Nothing decided yet — the queue is waiting.</p>
          ) : (
            <div className="cx-card mt-2.5 divide-y divide-border">
              {recent.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="cx-body font-medium text-navy-900">
                      {d.clientItemSnapshot?.clientName ?? 'Client placement'}
                    </p>
                    <p className="cx-mono-meta text-navy-400">{new Date(d.createdAt).toLocaleString()}</p>
                  </div>
                  {d.decision === 'approved' && <VerificationSeal label="Approved" />}
                  {d.decision === 'rejected' && <StatusTag tone="destructive">Rejected</StatusTag>}
                  {d.decision === 'escalated' && (
                    <StatusTag tone={d.ticket?.status === 'resolved' ? 'success' : 'warning'}>
                      {d.ticket?.status === 'resolved' ? 'Ticket resolved' : 'Ticket open'}
                    </StatusTag>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="cx-label text-navy-400">What I&apos;ve been flagging</p>
          <div className="cx-card mt-2.5 divide-y divide-border">
            {Object.entries(stats.errTagBreakdown).map(([tag, n]) => (
              <div key={tag} className="flex items-center justify-between gap-4 p-4">
                <span className="cx-mono-meta font-semibold text-navy-500">{tag}</span>
                <span className="cx-meta text-right text-navy-400">
                  <span className="font-mono font-semibold text-navy-900">{n}</span>{' '}
                  {ERR_TAG_LABELS[tag as keyof typeof ERR_TAG_LABELS]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </OperatorAppShell>
  )
}
