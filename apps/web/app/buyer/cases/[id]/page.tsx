import { ArrowLeft, Clock, CheckCircle, XCircle, AlertTriangle, User } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BuyerAppShell } from '@/components/buyer/buyer-app-shell'
import { serverApiFetch } from '@/lib/api/server'
import { ApiError } from '@/lib/api/client'
import { ERR_TAG_LABELS, SEVERITY_LABELS } from '@oreset/shared'
import type { BuyerCaseDetail } from '@/lib/api/endpoints/buyer-cases'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  in_review: 'bg-accent/10 text-accent',
  approved: 'bg-success/10 text-success',
  corrected: 'bg-accent/10 text-accent',
  rejected: 'bg-destructive/10 text-destructive',
  escalated: 'bg-warning/10 text-warning',
  declined: 'bg-navy-100 text-navy-500',
  consensus_split: 'bg-navy-100 text-navy-600',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending review',
  in_review: 'In review (dual-solve)',
  approved: 'Approved',
  corrected: 'Corrected & passed',
  rejected: 'Rejected',
  escalated: 'Escalated',
  declined: 'Declined',
  consensus_split: 'Awaiting adjudication',
}

const DECISION_COLORS: Record<string, string> = {
  approved: 'bg-success/10 text-success border-success/20',
  corrected: 'bg-accent/10 text-accent border-accent/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  escalated: 'bg-warning/10 text-warning border-warning/20',
  declined: 'bg-navy-100 text-navy-500 border-navy-200',
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
  const traceData = item.traceData as Record<string, unknown> | null

  return (
    <BuyerAppShell>
      <Link href="/buyer/cases" className="inline-flex items-center gap-1.5 cx-meta text-navy-400 hover:text-navy-600 cx-fade mb-4">
        <ArrowLeft className="size-3.5" />
        Back to cases
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="cx-label text-navy-400">Case Detail</p>
          <h1 className="cx-page-title mt-1 text-navy-900">{item.clientName}</h1>
          <p className="cx-mono-meta mt-1 text-navy-400">{item.externalRef}</p>
        </div>
        <span className={cn('cx-body inline-flex rounded-full px-3 py-1 font-semibold', STATUS_COLORS[item.status] ?? 'bg-navy-100 text-navy-500')}>
          {STATUS_LABELS[item.status] ?? item.status}
        </span>
      </div>

      {/* Metadata */}
      <div className="mt-4 flex flex-wrap gap-3">
        {traceData?.language && (
          <span className="cx-meta rounded-full bg-navy-100 px-2.5 py-0.5 text-navy-600">
            {traceData.language as string}
          </span>
        )}
        {traceData?.domain && (
          <span className="cx-meta rounded-full bg-navy-100 px-2.5 py-0.5 text-navy-600">
            {traceData.domain as string}
          </span>
        )}
        {item.requiresDualSolve && (
          <span className="cx-meta rounded-full bg-accent/10 px-2.5 py-0.5 text-accent font-semibold">
            dual-solve
          </span>
        )}
        <span className="cx-meta text-navy-400">
          Submitted {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
        </span>
      </div>

      {/* Input content */}
      <div className="mt-6 cx-card p-5">
        <p className="cx-meta font-semibold text-navy-500 mb-2">Original Input</p>
        <div className="rounded-lg bg-navy-50 p-4">
          <p className="cx-body text-navy-800 whitespace-pre-wrap">{item.content}</p>
        </div>
      </div>

      {/* AI decision/outcome */}
      {(traceData?.aiDecision || traceData?.aiOutcome) && (
        <div className="mt-3 cx-card p-5">
          <p className="cx-meta font-semibold text-navy-500 mb-2">AI Output</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {traceData.aiDecision && (
              <div>
                <p className="cx-meta text-navy-400 mb-0.5">Decision</p>
                <p className="cx-body text-navy-800">{traceData.aiDecision as string}</p>
              </div>
            )}
            {traceData.aiOutcome && (
              <div>
                <p className="cx-meta text-navy-400 mb-0.5">Outcome</p>
                <p className="cx-body text-navy-800">{traceData.aiOutcome as string}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review decisions */}
      <div className="mt-6">
        <h2 className="cx-title text-navy-900 mb-3">
          Review {decisions.length === 1 ? 'Decision' : 'Decisions'} ({decisions.length})
        </h2>

        {decisions.length === 0 ? (
          <div className="cx-card flex flex-col items-center gap-3 p-8 text-center">
            <Clock className="size-6 text-navy-300" />
            <p className="cx-body text-navy-500">This case has not been reviewed yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {decisions.map((d, i) => (
              <div key={d.id} className={cn('cx-card overflow-hidden border-l-4', DECISION_COLORS[d.decision] ?? 'border-navy-200')}>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-navy-400" />
                      <span className="cx-meta font-semibold text-navy-500">
                        Reviewer {decisions.length > 1 ? i + 1 : ''}
                      </span>
                      <span className={cn('cx-meta inline-flex rounded-full px-2 py-0.5 font-semibold', DECISION_COLORS[d.decision])}>
                        {d.decision}
                      </span>
                    </div>
                    <span className="cx-meta text-navy-400">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {(d.errTag || d.severity) && (
                    <div className="flex gap-3">
                      {d.errTag && (
                        <span className="cx-meta text-navy-600">
                          {d.errTag} - {ERR_TAG_LABELS[d.errTag]}
                        </span>
                      )}
                      {d.severity && (
                        <span className="cx-meta text-navy-600">
                          {SEVERITY_LABELS[d.severity]}
                        </span>
                      )}
                    </div>
                  )}

                  {d.notes && (
                    <div>
                      <p className="cx-meta text-navy-400 mb-0.5">Reviewer Notes</p>
                      <p className="cx-body text-navy-700 text-sm">{d.notes}</p>
                    </div>
                  )}

                  {(d.correctedTranscript || d.correctedIntent || d.correctedOutcome) && (
                    <div className="rounded-lg bg-accent/5 p-3 space-y-2">
                      <p className="cx-meta font-semibold text-accent">Ground-Truth Corrections</p>
                      {d.correctedTranscript && (
                        <div>
                          <p className="cx-meta text-navy-400">Corrected Transcript</p>
                          <p className="cx-body text-navy-700 text-sm">{d.correctedTranscript}</p>
                        </div>
                      )}
                      {d.correctedIntent && (
                        <div>
                          <p className="cx-meta text-navy-400">Corrected Intent</p>
                          <p className="cx-body text-navy-700 text-sm">{d.correctedIntent}</p>
                        </div>
                      )}
                      {d.correctedOutcome && (
                        <div>
                          <p className="cx-meta text-navy-400">Corrected Outcome</p>
                          <p className="cx-body text-navy-700 text-sm">{d.correctedOutcome}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {d.reviewTimeMs && (
                    <p className="cx-meta text-navy-400 flex items-center gap-1">
                      <Clock className="size-3" />
                      Review time: {Math.round(d.reviewTimeMs / 1000)}s
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
