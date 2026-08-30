'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Gavel, User, Clock } from 'lucide-react'
import { OPERATOR_DECISIONS, ERR_TAGS, SEVERITY_LEVELS, OPERATOR_DECISION_LABELS, ERR_TAG_LABELS, SEVERITY_LABELS } from '@oreset/shared'
import type { ConsensusPair } from '@/lib/api/endpoints/consensus'
import { adjudicatePair, enableDualSolveBulk } from '@/lib/api/endpoints/consensus'
import { cn } from '@/lib/utils'

function DecisionBadge({ decision }: { decision: string }) {
  const colors: Record<string, string> = {
    approved: 'bg-success/10 text-success',
    corrected: 'bg-accent/10 text-accent',
    rejected: 'bg-destructive/10 text-destructive',
    escalated: 'bg-warning/10 text-warning',
    declined: 'bg-navy-100 text-navy-500',
  }
  return (
    <span className={cn('cx-meta inline-flex items-center rounded-full px-2 py-0.5 font-semibold', colors[decision] ?? 'bg-navy-100 text-navy-500')}>
      {decision}
    </span>
  )
}

function ReviewerDecisionCard({
  label,
  decision,
}: {
  label: string
  decision: {
    operatorId: string
    decision: string
    errTag: string | null
    severity: string | null
    notes: string | null
    correctedTranscript: string | null
    correctedIntent: string | null
    correctedOutcome: string | null
    reviewTimeMs: number | null
  } | null | undefined
}) {
  if (!decision) return null

  return (
    <div className="cx-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <User className="size-4 text-navy-400" />
        <p className="cx-meta font-semibold text-navy-500">{label}</p>
        <span className="cx-mono-meta text-navy-400">{decision.operatorId.slice(0, 8)}...</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="cx-meta text-navy-400 w-16 shrink-0">Decision</span>
          <DecisionBadge decision={decision.decision} />
        </div>
        {decision.errTag && (
          <div className="flex items-center gap-2">
            <span className="cx-meta text-navy-400 w-16 shrink-0">Error</span>
            <span className="cx-meta text-navy-700">{decision.errTag} - {ERR_TAG_LABELS[decision.errTag as keyof typeof ERR_TAG_LABELS]}</span>
          </div>
        )}
        {decision.severity && (
          <div className="flex items-center gap-2">
            <span className="cx-meta text-navy-400 w-16 shrink-0">Severity</span>
            <span className="cx-meta text-navy-700">{decision.severity}</span>
          </div>
        )}
        {decision.notes && (
          <div>
            <span className="cx-meta text-navy-400">Notes</span>
            <p className="cx-body mt-0.5 text-navy-700 text-sm">{decision.notes}</p>
          </div>
        )}
        {decision.correctedOutcome && (
          <div>
            <span className="cx-meta text-navy-400">Corrected outcome</span>
            <p className="cx-body mt-0.5 text-navy-700 text-sm">{decision.correctedOutcome}</p>
          </div>
        )}
        {decision.reviewTimeMs && (
          <div className="flex items-center gap-1.5">
            <Clock className="size-3 text-navy-400" />
            <span className="cx-meta text-navy-400">{Math.round(decision.reviewTimeMs / 1000)}s</span>
          </div>
        )}
      </div>
    </div>
  )
}

function AdjudicationCard({ pair, onAdjudicated }: { pair: ConsensusPair; onAdjudicated: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [finalDecision, setFinalDecision] = useState(pair.decisionOne?.decision ?? 'approved')
  const [finalErrTag, setFinalErrTag] = useState<string>('')
  const [finalSeverity, setFinalSeverity] = useState<string>('')
  const [adjNotes, setAdjNotes] = useState('')

  const handleAdjudicate = async () => {
    setSubmitting(true)
    try {
      await adjudicatePair(pair.id, {
        finalDecision: finalDecision as typeof OPERATOR_DECISIONS[number],
        ...(finalErrTag ? { finalErrTag: finalErrTag as typeof ERR_TAGS[number] } : {}),
        ...(finalSeverity ? { finalSeverity: finalSeverity as typeof SEVERITY_LEVELS[number] } : {}),
        ...(adjNotes ? { notes: adjNotes } : {}),
      })
      onAdjudicated()
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <div className="cx-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-navy-50/50 cx-fade"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="cx-body font-semibold text-navy-900">
              {pair.clientItem?.clientName ?? 'Unknown client'}
            </span>
            <span className="cx-mono-meta text-navy-400">{pair.clientItem?.externalRef}</span>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <span className="cx-meta text-navy-400">Reviewer 1:</span>
            <DecisionBadge decision={pair.decisionOne?.decision ?? '?'} />
            <span className="cx-meta text-navy-400">Reviewer 2:</span>
            <DecisionBadge decision={pair.decisionTwo?.decision ?? '?'} />
            {pair.agreementScore != null && (
              <span className="cx-meta text-navy-400">Score: {Math.round(pair.agreementScore * 100)}%</span>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp className="size-4 text-navy-400 shrink-0" /> : <ChevronDown className="size-4 text-navy-400 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-border p-4 space-y-4">
          {/* Original content */}
          {pair.clientItem?.content && (
            <div>
              <p className="cx-meta font-semibold text-navy-500 mb-1">Original Content</p>
              <div className="rounded-lg bg-navy-50 p-3">
                <p className="cx-body text-navy-800 text-sm whitespace-pre-wrap">{pair.clientItem.content}</p>
              </div>
            </div>
          )}

          {/* Side-by-side reviewer decisions */}
          <div className="grid gap-3 md:grid-cols-2">
            <ReviewerDecisionCard label="Reviewer 1" decision={pair.decisionOne} />
            <ReviewerDecisionCard label="Reviewer 2" decision={pair.decisionTwo} />
          </div>

          {/* Adjudication form */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Gavel className="size-4 text-accent" />
              <p className="cx-body font-semibold text-navy-900">Adjudicate</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="cx-meta font-semibold text-navy-500 mb-1 block">Final Decision</label>
                <select
                  value={finalDecision}
                  onChange={(e) => setFinalDecision(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 cx-body text-navy-800"
                >
                  {OPERATOR_DECISIONS.map((d) => (
                    <option key={d} value={d}>{OPERATOR_DECISION_LABELS[d]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="cx-meta font-semibold text-navy-500 mb-1 block">Error Tag</label>
                <select
                  value={finalErrTag}
                  onChange={(e) => setFinalErrTag(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 cx-body text-navy-800"
                >
                  <option value="">None</option>
                  {ERR_TAGS.map((t) => (
                    <option key={t} value={t}>{t} - {ERR_TAG_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="cx-meta font-semibold text-navy-500 mb-1 block">Severity</label>
                <select
                  value={finalSeverity}
                  onChange={(e) => setFinalSeverity(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 cx-body text-navy-800"
                >
                  <option value="">None</option>
                  {SEVERITY_LEVELS.map((s) => (
                    <option key={s} value={s}>{SEVERITY_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="cx-meta font-semibold text-navy-500 mb-1 block">Adjudication Notes</label>
              <textarea
                value={adjNotes}
                onChange={(e) => setAdjNotes(e.target.value)}
                placeholder="Explain the final decision..."
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 cx-body text-navy-800 resize-none"
              />
            </div>

            <div className="mt-3 flex justify-end">
              <button
                onClick={handleAdjudicate}
                disabled={submitting}
                className="rounded-lg bg-accent px-4 py-2 cx-body font-semibold text-white hover:bg-accent/90 disabled:opacity-50 cx-fade"
              >
                {submitting ? 'Submitting...' : 'Submit Adjudication'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function AdjudicationQueue({ initialPairs }: { initialPairs: ConsensusPair[] }) {
  const [pairs, setPairs] = useState(initialPairs)
  const [enabling, setEnabling] = useState(false)

  const handleEnableBulk = async () => {
    setEnabling(true)
    try {
      const result = await enableDualSolveBulk()
      alert(`Dual-solve enabled for ${result.count} pending items.`)
    } catch {
      alert('Failed to enable dual-solve.')
    }
    setEnabling(false)
  }

  const handleAdjudicated = (pairId: string) => {
    setPairs((prev) => prev.filter((p) => p.id !== pairId))
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="cx-title text-navy-900">Adjudication Queue</h2>
        <button
          onClick={handleEnableBulk}
          disabled={enabling}
          className="rounded-lg border border-accent bg-accent/5 px-3 py-1.5 cx-meta font-semibold text-accent hover:bg-accent/10 disabled:opacity-50 cx-fade"
        >
          {enabling ? 'Enabling...' : 'Enable Dual-Solve on All Pending'}
        </button>
      </div>

      {pairs.length === 0 ? (
        <div className="cx-card flex flex-col items-center gap-3 p-10 text-center">
          <Gavel className="size-8 text-navy-300" />
          <p className="cx-body text-navy-500">No disagreements pending adjudication.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pairs.map((pair) => (
            <AdjudicationCard
              key={pair.id}
              pair={pair}
              onAdjudicated={() => handleAdjudicated(pair.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
