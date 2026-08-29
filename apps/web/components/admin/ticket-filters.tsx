'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ERR_TAG_LABELS } from '@oreset/shared'
import type { ErrTag } from '@oreset/shared'
import { cn } from '@/lib/utils'
import { StatusTag } from '@/components/capture/status-tag'
import { TicketResolveClient } from './ticket-resolve-client'
import type { Ticket } from '@/lib/api/endpoints/tickets'

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'resolved', label: 'Resolved' },
] as const

export function TicketFilters({ tickets }: { tickets: Ticket[] }) {
  const [status, setStatus] = useState<'all' | 'open' | 'resolved'>('open')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(
    () => tickets.filter((t) => status === 'all' || t.status === status),
    [tickets, status],
  )

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div>
      {/* Filters */}
      <div className="mt-6 flex items-center gap-3">
        <div className="inline-flex rounded-lg bg-navy-100/60 p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={cn(
                'cx-meta rounded-md px-3 py-1.5 font-medium cx-fade',
                status === f.key
                  ? 'bg-card text-navy-900 shadow-xs'
                  : 'text-navy-500 hover:text-navy-800',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="cx-meta text-navy-400">
          {filtered.length} ticket{filtered.length === 1 ? '' : 's'}
        </p>
      </div>

      {/* Ticket cards */}
      {filtered.length === 0 ? (
        <p className="cx-body mt-4 text-navy-400">No tickets match this filter.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {filtered.map((t) => {
            const isExpanded = expandedId === t.id
            const decision = t.operatorReviewDecision
            const snapshot = decision?.clientItemSnapshot

            return (
              <div
                key={t.id}
                className={cn(
                  'rounded-xl border bg-card overflow-hidden transition-colors',
                  t.status === 'open' ? 'border-warning/20' : 'border-border',
                )}
              >
                {/* Header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(t.id)}
                  className="flex w-full items-start justify-between gap-4 p-4 text-left hover:bg-navy-50/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="cx-mono-meta font-semibold text-navy-800">
                        {t.externalRef}
                      </span>
                      {t.errTag && (
                        <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                          {t.errTag}
                        </span>
                      )}
                      {t.severity && (
                        <span className="rounded bg-navy-100 px-1.5 py-0.5 text-[10px] font-semibold text-navy-500">
                          {t.severity}
                        </span>
                      )}
                      {t.status === 'open' ? (
                        <StatusTag tone="warning">Open</StatusTag>
                      ) : (
                        <StatusTag tone="success">Resolved</StatusTag>
                      )}
                    </div>
                    <p className="cx-meta mt-1 text-navy-500">{t.clientName}</p>
                    {t.notes && (
                      <p className="cx-body mt-1.5 text-navy-700 line-clamp-2">{t.notes}</p>
                    )}
                    <p className="cx-mono-meta mt-1 text-navy-400">
                      Escalated {new Date(t.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp className="size-4 text-navy-400" />
                    ) : (
                      <ChevronDown className="size-4 text-navy-400" />
                    )}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
                    {/* Error details */}
                    {t.errTag && (
                      <div className="rounded-lg border border-border bg-navy-50 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-navy-400 mb-1">
                          Error Classification
                        </p>
                        <p className="cx-body text-navy-800">
                          <span className="font-semibold">{t.errTag}</span>
                          {' — '}
                          {ERR_TAG_LABELS[t.errTag as ErrTag] ?? t.errTag}
                        </p>
                        {t.severity && (
                          <p className="cx-meta mt-1 text-navy-500">Severity: {t.severity}</p>
                        )}
                      </div>
                    )}

                    {/* Original case content */}
                    {snapshot?.content && (
                      <div className="rounded-lg border border-border bg-background p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-navy-400 mb-1">
                          Original Case Content
                        </p>
                        <p className="cx-body text-navy-800 leading-relaxed whitespace-pre-wrap">
                          {snapshot.content}
                        </p>
                      </div>
                    )}

                    {/* Operator's notes */}
                    {t.notes && (
                      <div className="rounded-lg border border-warning/20 bg-warning/5 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-warning mb-1">
                          Operator&apos;s Escalation Notes
                        </p>
                        <p className="cx-body text-navy-800">{t.notes}</p>
                      </div>
                    )}

                    {/* Ground-truth corrections if present */}
                    {(decision?.correctedTranscript || decision?.correctedIntent || decision?.correctedOutcome) && (
                      <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-accent mb-2">
                          Operator&apos;s Corrections
                        </p>
                        {decision.correctedTranscript && (
                          <div className="mb-2">
                            <p className="text-[11px] font-medium text-navy-500">Corrected Transcript</p>
                            <p className="cx-body text-navy-800">{decision.correctedTranscript}</p>
                          </div>
                        )}
                        {decision.correctedIntent && (
                          <div className="mb-2">
                            <p className="text-[11px] font-medium text-navy-500">Corrected Intent</p>
                            <p className="cx-body text-navy-800">{decision.correctedIntent}</p>
                          </div>
                        )}
                        {decision.correctedOutcome && (
                          <div>
                            <p className="text-[11px] font-medium text-navy-500">Corrected Outcome</p>
                            <p className="cx-body text-navy-800">{decision.correctedOutcome}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Resolution */}
                    {t.status === 'resolved' && (
                      <div className="rounded-lg border border-success/20 bg-success/5 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-success mb-1">
                          Resolution
                        </p>
                        {t.resolutionNotes && (
                          <p className="cx-body text-navy-800">{t.resolutionNotes}</p>
                        )}
                        <p className="cx-mono-meta mt-1 text-navy-400">
                          Resolved by {t.resolvedByUser?.displayName ?? 'Staff'} on{' '}
                          {t.resolvedAt
                            ? new Date(t.resolvedAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </p>
                      </div>
                    )}

                    {/* Resolve action */}
                    {t.status === 'open' && (
                      <div className="flex justify-end pt-1">
                        <TicketResolveClient ticketId={t.id} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
