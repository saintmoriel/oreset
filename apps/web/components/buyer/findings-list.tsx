'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle2, Loader2, RotateCcw, ShieldAlert, ShieldCheck, Wrench } from 'lucide-react'
import { VULN_TAG_LABELS, SEVERITY_LABELS, EXPLOIT_STATUS_LABELS, FINDING_STATUS_LABELS } from '@oreset/shared'
import type { FindingStatus, Severity } from '@oreset/shared'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api/client'
import { toast } from '@/components/ui/toast'
import { getMyFindings, markFindingFixed } from '@/lib/api/endpoints/findings'
import type { ClientFinding, ClientFindingsResponse } from '@/lib/api/endpoints/findings'

const SEVERITY_TONE: Record<Severity, string> = {
  P0: 'bg-destructive text-white',
  P1: 'bg-destructive/15 text-destructive',
  P2: 'bg-warning/15 text-warning',
  P3: 'bg-navy-100 text-navy-600',
}

const STATUS_TONE: Record<FindingStatus, string> = {
  discovered: 'bg-navy-100 text-navy-500',
  verified: 'bg-destructive/10 text-destructive',
  fix_submitted: 'bg-accent/10 text-accent',
  retesting: 'bg-accent/10 text-accent',
  closed: 'bg-success/10 text-success',
  reopened: 'bg-destructive/10 text-destructive',
  false_positive: 'bg-navy-100 text-navy-400',
}

const STATUS_SHORT: Record<FindingStatus, string> = {
  discovered: 'Pending verification',
  verified: 'Open',
  fix_submitted: 'Retest queued',
  retesting: 'Retesting',
  closed: 'Closed',
  reopened: 'Reopened',
  false_positive: 'False positive',
}

type FilterKey = 'all' | 'open' | 'fixing' | 'closed' | 'pending' | 'false_positive'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'fixing', label: 'In retest' },
  { key: 'closed', label: 'Closed' },
  { key: 'pending', label: 'Pending verification' },
  { key: 'false_positive', label: 'False positives' },
]

function matchesFilter(f: ClientFinding, key: FilterKey) {
  switch (key) {
    case 'all': return true
    case 'open': return f.status === 'verified' || f.status === 'reopened'
    case 'fixing': return f.status === 'fix_submitted' || f.status === 'retesting'
    case 'closed': return f.status === 'closed'
    case 'pending': return f.status === 'discovered'
    case 'false_positive': return f.status === 'false_positive'
  }
}

function Step({ done, active, label }: { done: boolean; active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          'flex size-4 items-center justify-center rounded-full border text-[9px] font-bold',
          done ? 'border-success bg-success text-white' : active ? 'border-accent bg-accent/10 text-accent' : 'border-navy-200 bg-card text-navy-300',
        )}
      >
        {done ? '✓' : ''}
      </span>
      <span className={cn('text-[11px]', done || active ? 'font-semibold text-navy-800' : 'text-navy-400')}>{label}</span>
    </div>
  )
}

function Lifecycle({ f }: { f: ClientFinding }) {
  const order: FindingStatus[] = ['discovered', 'verified', 'fix_submitted', 'closed']
  const current = f.status === 'reopened' ? 'verified' : f.status === 'retesting' ? 'fix_submitted' : f.status
  const idx = order.indexOf(current as FindingStatus)
  if (f.status === 'false_positive') return null
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <Step done={idx > 0} active={idx === 0} label="Discovered" />
      <Step done={idx > 1} active={idx === 1} label="Verified" />
      <Step done={idx > 2} active={idx === 2} label="Fix submitted" />
      <Step done={idx >= 3} active={false} label="Retested and closed" />
    </div>
  )
}

function FindingCard({ f, onChanged }: { f: ClientFinding; onChanged: () => Promise<void> }) {
  const [expanded, setExpanded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canMarkFixed = f.id !== null && (f.status === 'verified' || f.status === 'reopened')

  async function handleMarkFixed() {
    if (!f.id) return
    setSubmitting(true)
    setError(null)
    try {
      await markFindingFixed(f.id)
      toast.success('Retest queued', 'A tester will re-run the same attack. You will see the result here.')
      await onChanged()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not queue the retest.'
      setError(message)
      toast.error('Retest not queued', message)
    }
    setSubmitting(false)
  }

  return (
    <div className={cn('cx-card overflow-hidden', f.status === 'false_positive' && 'opacity-70')}>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-start gap-3 p-4 text-left hover:bg-navy-50/40 cx-fade"
      >
        {f.severity ? (
          <span className={cn('mt-0.5 rounded px-2 py-1 font-mono text-xs font-bold', SEVERITY_TONE[f.severity])}>{f.severity}</span>
        ) : (
          <span className="mt-0.5 rounded bg-navy-100 px-2 py-1 font-mono text-xs font-bold text-navy-400">n/a</span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="cx-body font-semibold text-navy-900">
              {f.vulnTag ? VULN_TAG_LABELS[f.vulnTag] : 'Uncategorised finding'}
            </span>
            <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', STATUS_TONE[f.status])}>
              {STATUS_SHORT[f.status]}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <span className="cx-mono-meta text-navy-400">{f.externalRef}</span>
            {f.targetEndpoint && <span className="cx-mono-meta text-navy-400">{f.targetEndpoint}</span>}
            {f.attackType && <span className="cx-meta text-navy-500">{f.attackType}</span>}
            <span className="cx-meta text-navy-400">Found {new Date(f.foundAt).toLocaleDateString()}</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="size-4 shrink-0 text-navy-400" /> : <ChevronDown className="size-4 shrink-0 text-navy-400" />}
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-border p-4">
          <Lifecycle f={f} />

          <p className="cx-meta text-navy-500">{FINDING_STATUS_LABELS[f.status]}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            {f.severity && (
              <div>
                <p className="cx-meta font-semibold text-navy-500">Severity</p>
                <p className="cx-body text-navy-800">{f.severity}: {SEVERITY_LABELS[f.severity]}</p>
              </div>
            )}
            {f.exploitStatus && (
              <div>
                <p className="cx-meta font-semibold text-navy-500">Exploit status</p>
                <p className="cx-body text-navy-800">{EXPLOIT_STATUS_LABELS[f.exploitStatus]}</p>
              </div>
            )}
          </div>

          {f.blastRadius && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-destructive">Business impact if exploited</p>
              <p className="cx-body mt-1 whitespace-pre-wrap text-navy-800">{f.blastRadius}</p>
            </div>
          )}

          {f.reproductionSteps && (
            <div>
              <p className="cx-meta font-semibold text-navy-500">Reproduction steps</p>
              <p className="cx-body mt-0.5 whitespace-pre-wrap text-navy-800">{f.reproductionSteps}</p>
            </div>
          )}

          {f.recommendedFix && (
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">Recommended fix</p>
              <p className="cx-body mt-1 whitespace-pre-wrap text-navy-800">{f.recommendedFix}</p>
            </div>
          )}

          {f.testerNotes && (
            <div>
              <p className="cx-meta font-semibold text-navy-500">Tester notes</p>
              <p className="cx-body mt-0.5 whitespace-pre-wrap text-navy-700">{f.testerNotes}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 cx-meta text-navy-400">
            {f.verifiedAt && (
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="size-3" /> Verified {new Date(f.verifiedAt).toLocaleDateString()}
                {f.reproducible === true ? ', reproduced by auditor' : ''}
              </span>
            )}
            {f.fixSubmittedAt && (
              <span className="inline-flex items-center gap-1">
                <Wrench className="size-3" /> Fix submitted {new Date(f.fixSubmittedAt).toLocaleDateString()}
              </span>
            )}
            {f.retestedAt && (
              <span className="inline-flex items-center gap-1">
                <RotateCcw className="size-3" /> Retested {new Date(f.retestedAt).toLocaleDateString()}
              </span>
            )}
            {f.closedAt && (
              <span className="inline-flex items-center gap-1 text-success">
                <CheckCircle2 className="size-3" /> Closed {new Date(f.closedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {error && <p className="cx-body text-destructive">{error}</p>}

          {canMarkFixed && (
            <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
              <p className="cx-meta text-navy-500">
                Patched it? We will re-run the same attack against your agent at no extra cost.
              </p>
              <button
                type="button"
                onClick={handleMarkFixed}
                disabled={submitting}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-accent px-4 cx-body font-semibold text-white hover:bg-accent/90 disabled:opacity-50 cx-fade"
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Wrench className="size-4" />}
                Mark as fixed, request retest
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function FindingsList({ initial }: { initial: ClientFindingsResponse }) {
  const [data, setData] = useState(initial)
  const [filter, setFilter] = useState<FilterKey>('all')

  async function refresh() {
    const res = await getMyFindings()
    setData(res)
  }

  const filtered = useMemo(() => data.findings.filter((f) => matchesFilter(f, filter)), [data.findings, filter])

  const counts: Record<FilterKey, number> = {
    all: data.findings.length,
    open: data.counts.open - data.counts.fixSubmitted,
    fixing: data.counts.fixSubmitted,
    closed: data.counts.closed,
    pending: data.counts.pendingVerification,
    false_positive: data.counts.falsePositive,
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              'cx-meta rounded-full px-3 py-1 font-semibold cx-fade',
              filter === f.key ? 'bg-accent text-white' : 'bg-navy-100 text-navy-500 hover:bg-navy-200',
            )}
          >
            {f.label} <span className="ml-1 tabular-nums opacity-70">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="cx-card flex flex-col items-center gap-3 p-10 text-center">
          {data.findings.length === 0 ? (
            <>
              <ShieldAlert className="size-8 text-navy-300" />
              <p className="cx-body text-navy-500">No findings yet. They appear here as testers confirm them and a lead auditor verifies them.</p>
            </>
          ) : (
            <p className="cx-body text-navy-500">No findings match this filter.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((f) => (
            <FindingCard key={f.id ?? f.decisionId} f={f} onChanged={refresh} />
          ))}
        </div>
      )}
    </div>
  )
}
