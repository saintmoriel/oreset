'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle2, Loader2, Scale, ShieldCheck, XCircle } from 'lucide-react'
import {
  VULN_TAG_LABELS,
  SEVERITY_LEVELS,
  SEVERITY_LABELS,
  EXPLOIT_STATUS_LABELS,
} from '@oreset/shared'
import type { AuditorDecision, Severity } from '@oreset/shared'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api/client'
import { toast } from '@/components/ui/toast'
import { getVerificationQueue, verifyFinding } from '@/lib/api/endpoints/findings'
import type { VerificationQueueEntry } from '@/lib/api/endpoints/findings'
import { ExploitTracePanel, Badge } from '@/components/reviewer/exploit-trace-panel'

const SEVERITY_TONE: Record<Severity, string> = {
  P0: 'bg-destructive/10 text-destructive',
  P1: 'bg-destructive/5 text-destructive',
  P2: 'bg-warning/10 text-warning',
  P3: 'bg-navy-100 text-navy-600',
}

const VERDICTS: { value: AuditorDecision; label: string; hint: string; icon: typeof CheckCircle2; tone: string }[] = [
  {
    value: 'verified',
    label: 'Verify',
    hint: 'Real, reproducible, severity is right',
    icon: CheckCircle2,
    tone: 'border-success/60 bg-success/10 text-success',
  },
  {
    value: 'severity_adjusted',
    label: 'Adjust severity',
    hint: 'Real, but the tester got the severity wrong',
    icon: Scale,
    tone: 'border-accent/60 bg-accent/10 text-accent',
  },
  {
    value: 'false_positive',
    label: 'False positive',
    hint: 'Not reproducible or misclassified',
    icon: XCircle,
    tone: 'border-navy-400 bg-navy-100 text-navy-800',
  },
]

function VerificationCard({
  entry,
  onVerified,
}: {
  entry: VerificationQueueEntry
  onVerified: () => void
}) {
  const { decision, operator } = entry
  const snapshot = decision.clientItemSnapshot
  const [expanded, setExpanded] = useState(false)
  const [verdict, setVerdict] = useState<AuditorDecision | null>(null)
  const [adjustedSeverity, setAdjustedSeverity] = useState<Severity | null>(null)
  const [reproducible, setReproducible] = useState<boolean | null>(null)
  const [blastRadius, setBlastRadius] = useState('')
  const [auditorNotes, setAuditorNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEscalation = decision.decision === 'escalated'
  const needsAdjusted = verdict === 'severity_adjusted'
  const canSubmit =
    !!verdict &&
    reproducible !== null &&
    (!needsAdjusted || !!adjustedSeverity) &&
    (verdict !== 'false_positive' || auditorNotes.trim().length > 0) &&
    !submitting

  async function handleSubmit() {
    if (!canSubmit || !verdict || reproducible === null) return
    setSubmitting(true)
    setError(null)
    try {
      await verifyFinding(decision.id, {
        verdict,
        adjustedSeverity: needsAdjusted && adjustedSeverity ? adjustedSeverity : undefined,
        reproducible,
        blastRadius: blastRadius.trim() || undefined,
        auditorNotes: auditorNotes.trim() || undefined,
      })
      toast.success(
        verdict === 'verified' ? 'Finding verified' : verdict === 'severity_adjusted' ? `Severity adjusted to ${adjustedSeverity}` : 'Marked false positive',
        `${decision.clientItemId}. ${verdict === 'false_positive' ? 'It will not reach the client.' : 'It is now on the client dashboard.'}`,
      )
      onVerified()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not record the verdict.'
      setError(message)
      toast.error('Verdict not recorded', message)
      setSubmitting(false)
    }
  }

  return (
    <div className={cn('cx-card overflow-hidden', isEscalation ? 'border-warning/30' : decision.severity === 'P0' ? 'border-destructive/30' : '')}>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-start justify-between gap-4 p-4 text-left hover:bg-navy-50/40 cx-fade"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="cx-body font-semibold text-navy-900">{snapshot?.clientName ?? 'Client'}</span>
            <span className="cx-mono-meta text-navy-400">{decision.clientItemId}</span>
            {decision.severity && (
              <span className={cn('rounded px-1.5 py-0.5 font-mono text-[11px] font-bold', SEVERITY_TONE[decision.severity])}>
                {decision.severity}
              </span>
            )}
            {decision.vulnTag && <Badge tone="accent">{decision.vulnTag}</Badge>}
            {isEscalation ? <Badge tone="warning">Escalated</Badge> : <Badge>Exploited</Badge>}
          </div>
          <p className="cx-meta mt-1 text-navy-500">
            {decision.vulnTag ? VULN_TAG_LABELS[decision.vulnTag] : 'No category'}
            {decision.exploitStatus ? ` · ${EXPLOIT_STATUS_LABELS[decision.exploitStatus]}` : ''}
          </p>
          <p className="cx-mono-meta mt-1 text-navy-400">
            {operator?.displayName ?? 'Tester'}{operator?.operatorCode ? ` (${operator.operatorCode})` : ''} · {new Date(decision.createdAt).toLocaleString()}
          </p>
        </div>
        {expanded ? <ChevronUp className="size-4 shrink-0 text-navy-400" /> : <ChevronDown className="size-4 shrink-0 text-navy-400" />}
      </button>

      {expanded && (
        <div className="grid gap-6 border-t border-border p-4 lg:grid-cols-2">
          {/* Left: what the tester saw */}
          <div className="space-y-4">
            <ExploitTracePanel trace={snapshot?.traceData ?? null} content={snapshot?.content ?? ''} />

            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">Tester&apos;s assessment</p>
              <dl className="mt-2 space-y-2">
                {decision.reproductionSteps && (
                  <div>
                    <dt className="cx-meta text-navy-500">Reproduction steps</dt>
                    <dd className="cx-body whitespace-pre-wrap text-navy-800">{decision.reproductionSteps}</dd>
                  </div>
                )}
                {decision.recommendedFix && (
                  <div>
                    <dt className="cx-meta text-navy-500">Recommended fix</dt>
                    <dd className="cx-body whitespace-pre-wrap text-navy-800">{decision.recommendedFix}</dd>
                  </div>
                )}
                {decision.notes && (
                  <div>
                    <dt className="cx-meta text-navy-500">Notes</dt>
                    <dd className="cx-body whitespace-pre-wrap text-navy-800">{decision.notes}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Right: auditor verdict */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-navy-500">
              <ShieldCheck className="size-3.5" />
              Auditor verdict
            </div>

            <div>
              <p className="cx-meta mb-2 font-medium text-navy-500">Could you reproduce it?</p>
              <div className="grid grid-cols-2 gap-2">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    onClick={() => setReproducible(v)}
                    className={cn(
                      'rounded-lg border px-3 py-2 cx-meta font-semibold cx-fade',
                      reproducible === v
                        ? v ? 'border-success/60 bg-success/10 text-success' : 'border-destructive/50 bg-destructive/5 text-destructive'
                        : 'border-border bg-card text-navy-600 hover:bg-navy-50/40',
                    )}
                  >
                    {v ? 'Yes, reproduced' : 'No, could not reproduce'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="cx-meta mb-2 font-medium text-navy-500">Verdict</p>
              <div className="grid gap-2">
                {VERDICTS.map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => setVerdict(v.value)}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border p-3 text-left cx-fade',
                      verdict === v.value ? v.tone : 'border-border bg-card hover:bg-navy-50/40',
                    )}
                  >
                    <v.icon className="mt-0.5 size-4 shrink-0" />
                    <span>
                      <span className="cx-body block font-semibold">{v.label}</span>
                      <span className="cx-meta block text-navy-500">{v.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {needsAdjusted && (
              <div>
                <p className="cx-meta mb-2 font-medium text-navy-500">
                  Corrected severity {decision.severity ? `(tester said ${decision.severity})` : ''}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {SEVERITY_LEVELS.map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setAdjustedSeverity(sev)}
                      title={SEVERITY_LABELS[sev]}
                      className={cn(
                        'rounded-lg border px-3 py-2 font-mono text-sm font-bold cx-fade',
                        adjustedSeverity === sev ? 'border-accent/60 bg-accent/10 text-accent' : 'border-border bg-card text-navy-600 hover:bg-navy-50/40',
                      )}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
                {adjustedSeverity && <p className="cx-meta mt-1.5 text-navy-500">{SEVERITY_LABELS[adjustedSeverity]}</p>}
              </div>
            )}

            <div>
              <label className="cx-meta mb-1.5 block font-medium text-navy-500">Blast radius</label>
              <textarea
                value={blastRadius}
                onChange={(e) => setBlastRadius(e.target.value)}
                rows={3}
                className="cx-body w-full rounded-lg border border-border bg-card px-3 py-2 text-navy-800 placeholder:text-navy-300 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                placeholder="If this were exploited in production, what is the business consequence? Money moved, data exposed, decisions corrupted, who is affected."
              />
            </div>

            <div>
              <label className="cx-meta mb-1.5 block font-medium text-navy-500">
                Auditor notes {verdict === 'false_positive' ? '(required)' : '(optional)'}
              </label>
              <textarea
                value={auditorNotes}
                onChange={(e) => setAuditorNotes(e.target.value)}
                rows={2}
                className="cx-body w-full rounded-lg border border-border bg-card px-3 py-2 text-navy-800 placeholder:text-navy-300 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                placeholder={verdict === 'false_positive' ? 'Why is this not a real finding?' : 'Anything the client or the tester should know.'}
              />
            </div>

            {error && <p className="cx-body text-destructive">{error}</p>}

            <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
              <p className="cx-meta text-navy-500">
                {verdict === 'false_positive'
                  ? 'Scenario will be marked defended. Nothing reaches the client report.'
                  : verdict
                    ? 'Finding locks into the client dashboard and counts against their resilience score.'
                    : 'Pick a verdict to continue.'}
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-5 cx-body font-semibold text-white hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40 cx-fade"
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Record verdict
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function FindingsVerificationQueue({ initial }: { initial: VerificationQueueEntry[] }) {
  const [entries, setEntries] = useState(initial)
  const [refreshing, setRefreshing] = useState(false)

  async function refresh() {
    setRefreshing(true)
    try {
      const res = await getVerificationQueue()
      setEntries(res.findings)
    } catch {
      // apiFetch surfaces the error; keep the current list
    }
    setRefreshing(false)
  }

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="cx-title text-navy-900">Verification queue</h2>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="rounded-lg border border-border px-3 py-1.5 cx-meta font-semibold text-navy-600 hover:bg-navy-50 disabled:opacity-50 cx-fade"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="cx-card flex flex-col items-center gap-3 p-10 text-center">
          <ShieldCheck className="size-8 text-navy-300" />
          <p className="cx-body text-navy-500">Nothing awaiting verification. New P0/P1 exploits and escalations will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <VerificationCard
              key={entry.decision.id}
              entry={entry}
              onVerified={() => setEntries((prev) => prev.filter((e) => e.decision.id !== entry.decision.id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
