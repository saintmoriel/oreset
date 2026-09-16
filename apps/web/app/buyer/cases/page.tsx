import { Crosshair, Clock, ShieldAlert, ShieldCheck } from 'lucide-react'
import { BuyerAppShell } from '@/components/buyer/buyer-app-shell'
import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import type { BuyerCaseStats, BuyerCase } from '@/lib/api/endpoints/buyer-cases'
import { CasesList } from '@/components/buyer/cases-list'

export default async function BuyerCasesPage() {
  let stats: BuyerCaseStats
  let cases: BuyerCase[]
  try {
    ;[stats, { cases }] = await Promise.all([
      serverApiFetch<BuyerCaseStats>('/api/v1/buyer/cases/stats'),
      serverApiFetch<{ cases: BuyerCase[] }>('/api/v1/buyer/cases'),
    ])
  } catch (err) {
    redirectIfSignedOut(err, '/buyer')
  }

  return (
    <BuyerAppShell>
      <p className="cx-label text-navy-400">Engagement</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Attack scenarios</h1>
      <p className="cx-body mt-2 max-w-2xl text-navy-500">
        Each scenario is one attempt against your AI agent: an attack prompt, what the agent did, and
        the tester&apos;s verdict. Confirmed exploits become findings once a lead auditor verifies them.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <div className="cx-card flex items-center gap-3 p-4">
          <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
            <Crosshair className="size-5 text-accent" />
          </span>
          <div>
            <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">{stats.total}</p>
            <p className="cx-meta text-navy-400">Scenarios run</p>
          </div>
        </div>
        <div className="cx-card flex items-center gap-3 p-4">
          <span className="flex size-10 items-center justify-center rounded-lg bg-warning/10">
            <Clock className="size-5 text-warning" />
          </span>
          <div>
            <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">{stats.pending}</p>
            <p className="cx-meta text-navy-400">In progress</p>
          </div>
        </div>
        <div className="cx-card flex items-center gap-3 p-4">
          <span className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
            <ShieldAlert className="size-5 text-destructive" />
          </span>
          <div>
            <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">{stats.exploited}</p>
            <p className="cx-meta text-navy-400">Exploited</p>
          </div>
        </div>
        <div className="cx-card flex items-center gap-3 p-4">
          <span className="flex size-10 items-center justify-center rounded-lg bg-success/10">
            <ShieldCheck className="size-5 text-success" />
          </span>
          <div>
            <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">{stats.defended}</p>
            <p className="cx-meta text-navy-400">Defended</p>
          </div>
        </div>
      </div>

      {stats.escalated > 0 || stats.inconclusive > 0 || stats.consensusSplit > 0 ? (
        <div className="mt-2 flex flex-wrap gap-3">
          {stats.escalated > 0 && (
            <span className="cx-meta rounded-full bg-warning/10 px-2.5 py-0.5 font-semibold text-warning">
              {stats.escalated} with lead auditor
            </span>
          )}
          {stats.inconclusive > 0 && (
            <span className="cx-meta rounded-full bg-navy-100 px-2.5 py-0.5 font-semibold text-navy-500">
              {stats.inconclusive} inconclusive
            </span>
          )}
          {stats.consensusSplit > 0 && (
            <span className="cx-meta rounded-full bg-navy-100 px-2.5 py-0.5 font-semibold text-navy-500">
              {stats.consensusSplit} awaiting adjudication
            </span>
          )}
        </div>
      ) : null}

      <CasesList initialCases={cases} />
    </BuyerAppShell>
  )
}
