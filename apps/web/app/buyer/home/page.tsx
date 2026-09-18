import Link from 'next/link'
import { ArrowRight, Crosshair, FlaskConical, ShieldAlert } from 'lucide-react'
import { VULN_TAG_LABELS } from '@oreset/shared'
import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import { BuyerAppShell } from '@/components/buyer/buyer-app-shell'
import { ResilienceSummary, NotStartedSummary } from '@/components/buyer/resilience-summary'
import type { ClientFindingsResponse } from '@/lib/api/endpoints/findings'
import type { BuyerCaseStats } from '@/lib/api/endpoints/buyer-cases'

export default async function BuyerHomePage() {
  let findings: ClientFindingsResponse
  let stats: BuyerCaseStats
  try {
    ;[findings, stats] = await Promise.all([
      serverApiFetch<ClientFindingsResponse>('/api/v1/buyer/findings'),
      serverApiFetch<BuyerCaseStats>('/api/v1/buyer/cases/stats'),
    ])
  } catch (err) {
    redirectIfSignedOut(err, '/buyer')
  }

  // Highest-severity open findings first; the list is already sorted that way.
  const topOpen = findings.findings
    .filter((f) => f.status === 'verified' || f.status === 'reopened')
    .slice(0, 5)

  return (
    <BuyerAppShell>
      <p className="cx-label text-navy-400">Engagement</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Home</h1>
      <p className="cx-body mt-2 max-w-2xl text-navy-500">
        Findings stream in as the red team confirms them and a lead auditor verifies them. Fix, mark
        fixed, and we retest for free. The score moves as findings close.
      </p>

      {/* No score until something has actually been assessed. */}
      <div className="mt-6">
        {stats.total - stats.pending === 0 && findings.findings.length === 0 ? (
          <NotStartedSummary scenariosQueued={stats.pending} />
        ) : (
          <ResilienceSummary data={findings} />
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link href="/buyer/findings" className="cx-card flex items-center justify-between gap-3 p-5 hover:bg-navy-50/60">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-destructive/10"><ShieldAlert className="size-5 text-destructive" /></span>
            <div>
              <p className="cx-label text-navy-400">Findings</p>
              <p className="cx-body font-semibold text-navy-900">{findings.counts.open} open</p>
            </div>
          </div>
          <ArrowRight className="size-4 text-navy-400" />
        </Link>
        <Link href="/buyer/cases" className="cx-card flex items-center justify-between gap-3 p-5 hover:bg-navy-50/60">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10"><Crosshair className="size-5 text-accent" /></span>
            <div>
              <p className="cx-label text-navy-400">Scenarios</p>
              <p className="cx-body font-semibold text-navy-900">{stats.total} run, {stats.pending} in progress</p>
            </div>
          </div>
          <ArrowRight className="size-4 text-navy-400" />
        </Link>
        <Link href="/buyer/regressions" className="cx-card flex items-center justify-between gap-3 p-5 hover:bg-navy-50/60">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-navy-100"><FlaskConical className="size-5 text-navy-600" /></span>
            <div>
              <p className="cx-label text-navy-400">Regression suite</p>
              <p className="cx-body font-semibold text-navy-900">Run our attacks in your CI</p>
            </div>
          </div>
          <ArrowRight className="size-4 text-navy-400" />
        </Link>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <p className="cx-label text-navy-400">Fix these first</p>
          {topOpen.length > 0 && (
            <Link href="/buyer/findings" className="cx-meta font-semibold text-accent hover:text-copper-600">All findings</Link>
          )}
        </div>
        {topOpen.length === 0 ? (
          <p className="cx-body mt-2.5 text-navy-400">No open verified findings right now.</p>
        ) : (
          <div className="cx-card mt-2.5 divide-y divide-border">
            {topOpen.map((f) => (
              <Link key={f.id ?? f.decisionId} href="/buyer/findings" className="flex items-center gap-4 p-4 hover:bg-navy-50">
                <span className="rounded bg-navy-900 px-2 py-1 font-mono text-xs font-bold text-white">{f.severity ?? 'n/a'}</span>
                <div className="min-w-0 flex-1">
                  <p className="cx-body truncate font-medium text-navy-900">
                    {f.vulnTag ? VULN_TAG_LABELS[f.vulnTag] : 'Uncategorised finding'}
                  </p>
                  <p className="cx-mono-meta text-navy-400">
                    {f.externalRef}{f.targetEndpoint ? ` · ${f.targetEndpoint}` : ''}
                    {f.status === 'reopened' ? ' · reopened after retest' : ''}
                  </p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-navy-300" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </BuyerAppShell>
  )
}
