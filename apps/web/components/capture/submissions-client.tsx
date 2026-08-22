'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SubmissionSummary } from '@/lib/api/endpoints/submissions'
import type { SubmissionStatus } from '@oreset/shared'

const STATUS_STYLE: Record<SubmissionStatus, { icon: typeof Clock; label: string; text: string }> = {
  submitted: { icon: XCircle, label: 'Flagged', text: 'text-destructive' },
  validated: { icon: Clock, label: 'Awaiting review', text: 'text-navy-400' },
  qa_approved: { icon: CheckCircle2, label: 'Approved', text: 'text-success' },
  qa_rejected: { icon: XCircle, label: 'Rejected', text: 'text-destructive' },
}

const STATUS_FILTERS: { key: 'all' | SubmissionStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'qa_approved', label: 'Approved' },
  { key: 'qa_rejected', label: 'Rejected' },
  { key: 'validated', label: 'Awaiting review' },
]

function computeItemOrdinals(submissions: SubmissionSummary[]) {
  const byBatch = new Map<string, SubmissionSummary[]>()
  for (const s of submissions) {
    const arr = byBatch.get(s.batch.id) ?? []
    arr.push(s)
    byBatch.set(s.batch.id, arr)
  }
  const ordinals: Record<string, number> = {}
  for (const arr of byBatch.values()) {
    const sorted = [...arr].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    sorted.forEach((s, i) => {
      ordinals[s.id] = i + 1
    })
  }
  return ordinals
}

export function SubmissionsClient({ submissions }: { submissions: SubmissionSummary[] }) {
  const [status, setStatus] = useState<'all' | SubmissionStatus>('all')
  const [batchFilter, setBatchFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const ordinals = useMemo(() => computeItemOrdinals(submissions), [submissions])
  const batchTitles = useMemo(
    () => Array.from(new Set(submissions.map((s) => s.batch.title))).sort(),
    [submissions],
  )

  const decided = submissions.filter((s) => s.status === 'qa_approved' || s.status === 'qa_rejected')
  const approvalRate = decided.length
    ? `${Math.round((decided.filter((s) => s.status === 'qa_approved').length / decided.length) * 100)}%`
    : '—'

  const filtered = submissions.filter((s) => {
    if (status !== 'all' && s.status !== status) return false
    if (batchFilter !== 'all' && s.batch.title !== batchFilter) return false
    const day = s.createdAt.slice(0, 10)
    if (dateFrom && day < dateFrom) return false
    if (dateTo && day > dateTo) return false
    return true
  })

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <div className="cx-card p-5">
          <p className="cx-meta text-navy-400">Total submissions</p>
          <p className="cx-stat mt-1 text-navy-900">{submissions.length}</p>
        </div>
        <div className="cx-card p-5">
          <p className="cx-meta text-navy-400">Approval rate</p>
          <p className="cx-stat mt-1 text-navy-900">{approvalRate}</p>
        </div>
      </div>

      {submissions.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatus(f.key)}
                className={cn(
                  'cx-meta rounded-md px-2.5 py-1 font-medium cx-fade',
                  status === f.key ? 'bg-navy-800 text-white' : 'text-navy-400 hover:bg-navy-50',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="h-8 rounded-md border border-border bg-background px-2 cx-meta text-navy-800 outline-none focus-visible:border-accent"
          >
            <option value="all">All batches</option>
            {batchTitles.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>

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

      {submissions.length === 0 ? (
        <p className="cx-body mt-6 text-navy-400">Nothing submitted yet — start a batch to begin.</p>
      ) : filtered.length === 0 ? (
        <p className="cx-body mt-6 text-navy-400">No submissions match these filters.</p>
      ) : (
        <div className="cx-card mt-3 divide-y divide-border">
          {filtered.map((s) => {
            const { icon: Icon, label, text } = STATUS_STYLE[s.status]
            const failed = s.status === 'qa_rejected' || s.status === 'submitted'
            const reason = s.latestValidation?.reason
            return (
              <div key={s.id} className="flex flex-col gap-1.5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Icon className={cn('size-4 shrink-0', text)} />
                    <div>
                      <p className="cx-body font-medium text-navy-900">
                        {s.batch.title} · Item {ordinals[s.id]}
                      </p>
                      <p className="cx-meta text-navy-400">{new Date(s.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={cn('cx-meta font-semibold', text)}>{label}</span>
                </div>
                {reason && <p className="cx-meta pl-7 text-navy-400">{reason}</p>}
                {failed && (
                  <Link
                    href={`/capture/batches/${s.batch.id}`}
                    className="ml-7 w-fit cx-meta font-semibold text-accent hover:underline"
                  >
                    Retake
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
