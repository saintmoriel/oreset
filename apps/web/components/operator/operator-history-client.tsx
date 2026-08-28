'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { StatusTag } from '@/components/capture/status-tag'
import { VerificationSeal } from '@/components/capture/verification-seal'
import type { OperatorDecisionRecord } from '@/lib/api/endpoints/operator'

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Approved' },
  { key: 'escalated', label: 'Escalated' },
  { key: 'rejected', label: 'Rejected' },
] as const

export function OperatorHistoryClient({ decisions }: { decisions: OperatorDecisionRecord[] }) {
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]['key']>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const approved = decisions.filter((d) => d.decision === 'approved').length
  const approvalRate = decisions.length ? `${Math.round((approved / decisions.length) * 100)}%` : '—'

  const filtered = useMemo(
    () =>
      decisions.filter((d) => {
        if (status !== 'all' && d.decision !== status) return false
        const day = d.createdAt.slice(0, 10)
        if (dateFrom && day < dateFrom) return false
        if (dateTo && day > dateTo) return false
        return true
      }),
    [decisions, status, dateFrom, dateTo],
  )

  return (
    <div>
      <div className="cx-card flex divide-x divide-border">
        <div className="flex-1 p-5">
          <p className="cx-meta text-navy-400">Total decisions</p>
          <p className="cx-stat mt-1 text-navy-900">{decisions.length}</p>
        </div>
        <div className="flex-1 p-5">
          <p className="cx-meta text-navy-400">Approval rate</p>
          <p className="cx-stat mt-1 text-navy-900">{approvalRate}</p>
        </div>
      </div>

      {decisions.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg bg-navy-100/60 p-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatus(f.key)}
                className={cn(
                  'cx-meta rounded-md px-3 py-1.5 font-medium cx-fade',
                  status === f.key ? 'bg-card text-navy-900 shadow-xs' : 'text-navy-500 hover:text-navy-800',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              aria-label="From date"
              className="h-8 rounded-md border border-border bg-background px-2 cx-meta text-navy-800 outline-none focus-visible:border-accent"
            />
            <span className="cx-meta text-navy-400">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              aria-label="To date"
              className="h-8 rounded-md border border-border bg-background px-2 cx-meta text-navy-800 outline-none focus-visible:border-accent"
            />
          </div>
        </div>
      )}

      {decisions.length === 0 ? (
        <p className="cx-body mt-6 text-navy-400">No decisions yet — the queue is waiting.</p>
      ) : filtered.length === 0 ? (
        <p className="cx-body mt-6 text-navy-400">No decisions match these filters.</p>
      ) : (
        <div className="cx-card mt-3 divide-y divide-border">
          {filtered.map((d) => (
            <div key={d.id} className="flex flex-col gap-1.5 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="cx-body font-medium text-navy-900">
                    {d.clientItemSnapshot?.clientName ?? 'Client placement'}
                  </p>
                  <p className="cx-mono-meta text-navy-400">{new Date(d.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {d.decision === 'approved' && <VerificationSeal label="Approved" />}
                  {d.decision === 'rejected' && <StatusTag tone="destructive">Rejected</StatusTag>}
                  {d.decision === 'escalated' && (
                    <>
                      <span className="cx-mono-meta text-navy-400">
                        {d.errTag} / {d.severity}
                      </span>
                      <StatusTag tone={d.ticket?.status === 'resolved' ? 'success' : 'warning'}>
                        {d.ticket?.status === 'resolved' ? 'Ticket resolved' : 'Ticket open'}
                      </StatusTag>
                    </>
                  )}
                </div>
              </div>
              {d.notes && <p className="cx-meta text-navy-400">{d.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
