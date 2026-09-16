import { ArrowLeft, Clock, User } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BuyerAppShell } from '@/components/buyer/buyer-app-shell'
import { ExploitTracePanel } from '@/components/reviewer/exploit-trace-panel'
import { SCENARIO_STATUS_LABEL, SCENARIO_STATUS_TONE } from '@/components/buyer/cases-list'
import { serverApiFetch } from '@/lib/api/server'
import { ApiError } from '@/lib/api/client'
import { VULN_TAG_LABELS, SEVERITY_LABELS, EXPLOIT_STATUS_LABELS, OPERATOR_DECISION_LABELS } from '@oreset/shared'
import type { BuyerCaseDetail } from '@/lib/api/endpoints/buyer-cases'
import { cn } from '@/lib/utils'

const DECISION_TONE: Record<string, string> = {
  exploited: 'bg-destructive/10 text-destructive border-destructive/20',
  defended: 'bg-success/10 text-success border-success/20',
  escalated: 'bg-warning/10 text-warning border-warning/20',
  inconclusive: 'bg-navy-100 text-navy-500 border-navy-200',
}

export default async function BuyerCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let data: BuyerCaseDetail
  try {
    data = await serverApiFetch<BuyerCaseDetail>(`/api/v1/buyer/cases/${id}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const { item, decisions } = data
  const trace = (item.traceData ?? {}) as Record<string, unknown>

  return (
    <BuyerAppShell>
      <Link href="/buyer/cases" className="mb-4 inline-flex items-center gap-1.5 cx-meta text-navy-400 hover:text-navy-600 cx-fade">
        <ArrowLeft className="size-3.5" />
        Back to scenarios
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="cx-label text-navy-400">Attack scenario</p>
          <h1 className="cx-page-title mt-1 text-navy-900">{item.clientName}</h1>
          <p className="cx-mono-meta mt-1 text-navy-400">{item.externalRef}</p>
        </div>
        <span className={cn('cx-body inline-flex rounded-full px-3 py-1 font-semibold', SCENARIO_STATUS_TONE[item.status] ?? 'bg-navy-100 text-navy-500')}>
          {SCENARIO_STATUS_LABEL[item.status] ?? item.status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {typeof trace.attackType === 'string' && (
          <span className="cx-meta rounded-full bg-accent/10 px-2.5 py-0.5 font-semibold text-accent">{trace.attackType}</span>
        )}
        {typeof trace.domain === 'string' && (
          <span className="cx-meta rounded-full bg-navy-100 px-2.5 py-0.5 text-navy-600">{trace.domain}</span>
        )}
        {item.requiresDualSolve && (
          <span className="cx-meta rounded-full bg-accent/10 px-2.5 py-0.5 font-semibold text-accent">dual-solve</span>
        )}
        <span className="cx-meta text-navy-400">
          Submitted {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
        </span>
      </div>

      <div className="mt-6">
        <ExploitTracePanel trace={item.traceData} content={item.content} />
      </div>

      <div className="mt-8">
        <h2 className="cx-title mb-3 text-navy-900">
          Tester {decisions.length === 1 ? 'assessment' : 'assessments'} ({decisions.length})
        </h2>

        {decisions.length === 0 ? (
          <div className="cx-card flex flex-col items-center gap-3 p-8 text-center">
            <Clock className="size-6 text-navy-300" />
            <p className="cx-body text-navy-500">This scenario has not been assessed yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {decisions.map((d, i) => (
              <div key={d.id} className={cn('cx-card overflow-hidden border-l-4', DECISION_TONE[d.decision] ?? 'border-navy-200')}>
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-navy-400" />
                      <span className="cx-meta font-semibold text-navy-500">Tester {decisions.length > 1 ? i + 1 : ''}</span>
                      <span className={cn('cx-meta inline-flex rounded-full px-2 py-0.5 font-semibold', DECISION_TONE[d.decision])}>
                        {OPERATOR_DECISION_LABELS[d.decision].split('. ')[0]}
                      </span>
                    </div>
                    <span className="cx-meta text-navy-400">{new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {d.vulnTag && (
                      <div>
                        <p className="cx-meta text-navy-400">Vulnerability</p>
                        <p className="cx-body text-navy-800">{d.vulnTag}: {VULN_TAG_LABELS[d.vulnTag]}</p>
                      </div>
                    )}
                    {d.exploitStatus && (
                      <div>
                        <p className="cx-meta text-navy-400">Exploit status</p>
                        <p className="cx-body text-navy-800">{EXPLOIT_STATUS_LABELS[d.exploitStatus]}</p>
                      </div>
                    )}
                    {d.severity && (
                      <div>
                        <p className="cx-meta text-navy-400">Severity</p>
                        <p className="cx-body text-navy-800">{d.severity}: {SEVERITY_LABELS[d.severity]}</p>
                      </div>
                    )}
                  </div>

                  {d.reproductionSteps && (
                    <div>
                      <p className="cx-meta mb-0.5 text-navy-400">Reproduction steps</p>
                      <p className="cx-body whitespace-pre-wrap text-sm text-navy-700">{d.reproductionSteps}</p>
                    </div>
                  )}

                  {d.recommendedFix && (
                    <div className="rounded-lg bg-accent/5 p-3">
                      <p className="cx-meta font-semibold text-accent">Recommended fix</p>
                      <p className="cx-body mt-0.5 whitespace-pre-wrap text-sm text-navy-700">{d.recommendedFix}</p>
                    </div>
                  )}

                  {d.notes && (
                    <div>
                      <p className="cx-meta mb-0.5 text-navy-400">Tester notes</p>
                      <p className="cx-body whitespace-pre-wrap text-sm text-navy-700">{d.notes}</p>
                    </div>
                  )}

                  {d.reviewTimeMs && (
                    <p className="flex items-center gap-1 cx-meta text-navy-400">
                      <Clock className="size-3" />
                      Assessment time: {Math.round(d.reviewTimeMs / 1000)}s
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BuyerAppShell>
  )
}
