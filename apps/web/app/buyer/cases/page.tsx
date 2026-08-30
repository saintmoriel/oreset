import { FileSearch, Clock, CheckCircle, XCircle, AlertTriangle, Upload } from 'lucide-react'
import { BuyerAppShell } from '@/components/buyer/buyer-app-shell'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'
import type { BuyerCaseStats, BuyerCase } from '@/lib/api/endpoints/buyer-cases'
import { CasesList } from '@/components/buyer/cases-list'

export default async function BuyerCasesPage() {
  const [{ user }, stats, casesRes] = await Promise.all([
    serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me'),
    serverApiFetch<BuyerCaseStats>('/api/v1/buyer/cases/stats'),
    serverApiFetch<{ cases: BuyerCase[] }>('/api/v1/buyer/cases'),
  ])

  return (
    <BuyerAppShell>
      <p className="cx-label text-navy-400">Verification Portal</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Cases</h1>
      <p className="cx-body mt-2 max-w-lg text-navy-500">
        Submit AI decisions for verification and track their status. Each case is reviewed
        by certified operators who verify language understanding and decision correctness.
      </p>

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <div className="cx-card flex items-center gap-3 p-4">
          <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
            <FileSearch className="size-5 text-accent" />
          </span>
          <div>
            <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">{stats.total}</p>
            <p className="cx-meta text-navy-400">Total Cases</p>
          </div>
        </div>
        <div className="cx-card flex items-center gap-3 p-4">
          <span className="flex size-10 items-center justify-center rounded-lg bg-warning/10">
            <Clock className="size-5 text-warning" />
          </span>
          <div>
            <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">{stats.pending}</p>
            <p className="cx-meta text-navy-400">Pending</p>
          </div>
        </div>
        <div className="cx-card flex items-center gap-3 p-4">
          <span className="flex size-10 items-center justify-center rounded-lg bg-success/10">
            <CheckCircle className="size-5 text-success" />
          </span>
          <div>
            <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">{stats.approved}</p>
            <p className="cx-meta text-navy-400">Approved</p>
          </div>
        </div>
        <div className="cx-card flex items-center gap-3 p-4">
          <span className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
            <XCircle className="size-5 text-destructive" />
          </span>
          <div>
            <p className="font-mono text-xl font-semibold tabular-nums text-navy-900">{stats.rejected}</p>
            <p className="cx-meta text-navy-400">Rejected</p>
          </div>
        </div>
      </div>

      {stats.corrected > 0 || stats.escalated > 0 || stats.consensusSplit > 0 ? (
        <div className="mt-2 flex flex-wrap gap-3">
          {stats.corrected > 0 && (
            <span className="cx-meta rounded-full bg-accent/10 px-2.5 py-0.5 text-accent font-semibold">
              {stats.corrected} corrected
            </span>
          )}
          {stats.escalated > 0 && (
            <span className="cx-meta rounded-full bg-warning/10 px-2.5 py-0.5 text-warning font-semibold">
              {stats.escalated} escalated
            </span>
          )}
          {stats.consensusSplit > 0 && (
            <span className="cx-meta rounded-full bg-navy-100 px-2.5 py-0.5 text-navy-500 font-semibold">
              {stats.consensusSplit} awaiting adjudication
            </span>
          )}
        </div>
      ) : null}

      <CasesList initialCases={casesRes.cases} />
    </BuyerAppShell>
  )
}
