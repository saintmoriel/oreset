import { VULN_TAG_LABELS } from '@oreset/shared'
import type { Severity, VulnTag } from '@oreset/shared'
import { cn } from '@/lib/utils'
import type { ClientFindingsResponse } from '@/lib/api/endpoints/findings'

// Score is a hero number, not a chart. Breakdowns are single-hue bars with
// the value written next to every row, so nothing depends on color alone.

const SEVERITY_ROWS: { key: Severity; label: string; bar: string }[] = [
  { key: 'P0', label: 'P0 Critical', bar: 'bg-destructive' },
  { key: 'P1', label: 'P1 High', bar: 'bg-destructive/60' },
  { key: 'P2', label: 'P2 Medium', bar: 'bg-warning' },
  { key: 'P3', label: 'P3 Low', bar: 'bg-navy-300' },
]

function scoreTone(score: number) {
  if (score >= 90) return { ring: 'stroke-success', text: 'text-success' }
  if (score >= 70) return { ring: 'stroke-warning', text: 'text-warning' }
  return { ring: 'stroke-destructive', text: 'text-destructive' }
}

function ScoreRing({ score }: { score: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  const tone = scoreTone(score)
  return (
    <svg viewBox="0 0 120 120" className="size-32 shrink-0" role="img" aria-label={`Resilience score ${score} out of 100`}>
      <circle cx="60" cy="60" r={r} fill="none" className="stroke-navy-100" strokeWidth="8" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        className={tone.ring}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${(score / 100) * c} ${c}`}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="66" textAnchor="middle" className="fill-navy-900 font-mono text-[28px] font-semibold">
        {score}
      </text>
    </svg>
  )
}

function BarRow({ label, value, max, bar }: { label: string; value: number; max: number; bar: string }) {
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 4 : 0) : 0
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
      <p className="cx-meta truncate text-navy-700">{label}</p>
      <p className="cx-mono-meta tabular-nums text-navy-900">{value}</p>
      <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-navy-100">
        <div className={cn('h-full rounded-full', bar)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// Before any scenario has been assessed there is no score to show. A default
// of 100 would read as "your agent is fine", which is not something we know.
export function NotStartedSummary({ scenariosQueued }: { scenariosQueued: number }) {
  return (
    <div className="cx-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="flex size-32 shrink-0 items-center justify-center rounded-full border-8 border-navy-100">
        <span className="font-mono text-2xl font-semibold text-navy-300">?</span>
      </div>
      <div>
        <p className="cx-label text-navy-400">Agent resilience score</p>
        <p className="cx-title mt-1 text-navy-900">Not scored yet</p>
        <p className="cx-meta mt-2 max-w-xl text-navy-500">
          {scenariosQueued > 0
            ? `${scenariosQueued} attack scenario${scenariosQueued === 1 ? ' is' : 's are'} queued for the red team. The score appears once a lead auditor has verified the first finding, or the first scenarios come back defended.`
            : 'Your engagement has not started testing yet. Scenarios appear here as the red team begins, and the score follows the first verified result.'}
        </p>
        <p className="cx-meta mt-2 text-navy-400">
          A score of 100 would mean every scenario was defended. We do not show one until we have earned it.
        </p>
      </div>
    </div>
  )
}

export function ResilienceSummary({ data }: { data: ClientFindingsResponse }) {
  const tone = scoreTone(data.score)
  const sevMax = Math.max(0, ...SEVERITY_ROWS.map((r) => data.breakdown.bySeverity[r.key] ?? 0))
  const vulnRows = (Object.entries(data.breakdown.byVulnTag) as [VulnTag, number][])
    .sort((a, b) => b[1] - a[1])
  const vulnMax = Math.max(0, ...vulnRows.map(([, n]) => n))
  const hasOpen = data.counts.open > 0

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
      {/* Hero: the score */}
      <div className="cx-card flex items-center gap-6 p-6">
        <ScoreRing score={data.score} />
        <div>
          <p className="cx-label text-navy-400">Agent resilience score</p>
          <p className={cn('cx-title mt-1', tone.text)}>{data.label}</p>
          <p className="cx-meta mt-2 text-navy-500">
            {hasOpen
              ? `${data.counts.open} open finding${data.counts.open === 1 ? '' : 's'} counting against the score. Each closed retest raises it.`
              : data.counts.pendingVerification > 0
                ? 'No verified findings yet. Some are awaiting lead auditor verification.'
                : 'No verified open findings. Testing may still be in progress.'}
          </p>
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
            <div><dt className="sr-only">Open</dt><dd className="cx-meta text-navy-600"><span className="font-mono font-semibold text-navy-900">{data.counts.open}</span> open</dd></div>
            <div><dt className="sr-only">In retest</dt><dd className="cx-meta text-navy-600"><span className="font-mono font-semibold text-navy-900">{data.counts.fixSubmitted}</span> in retest</dd></div>
            <div><dt className="sr-only">Closed</dt><dd className="cx-meta text-navy-600"><span className="font-mono font-semibold text-navy-900">{data.counts.closed}</span> closed</dd></div>
            <div><dt className="sr-only">Pending verification</dt><dd className="cx-meta text-navy-600"><span className="font-mono font-semibold text-navy-900">{data.counts.pendingVerification}</span> pending verification</dd></div>
          </dl>
        </div>
      </div>

      {/* Open findings by severity */}
      <div className="cx-card p-5">
        <p className="cx-label text-navy-400">Open findings by severity</p>
        <div className="mt-3 space-y-3">
          {SEVERITY_ROWS.map((r) => (
            <BarRow key={r.key} label={r.label} value={data.breakdown.bySeverity[r.key] ?? 0} max={sevMax} bar={r.bar} />
          ))}
        </div>
      </div>

      {/* Open findings by category */}
      <div className="cx-card p-5">
        <p className="cx-label text-navy-400">Open findings by category</p>
        {vulnRows.length === 0 ? (
          <p className="cx-meta mt-3 text-navy-400">Nothing open.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {vulnRows.map(([tag, n]) => (
              <BarRow key={tag} label={`${tag} ${VULN_TAG_LABELS[tag] ?? ''}`} value={n} max={vulnMax} bar="bg-accent" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
