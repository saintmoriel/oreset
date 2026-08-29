'use client'

import { useState } from 'react'
import { Send, BookOpen, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OutcomeVerdict, CaseSeverity, VerificationScope } from '@/lib/types/case'

const VERDICT_OPTIONS: {
  value: OutcomeVerdict
  label: string
  description: string
  scopeBOnly?: boolean
}[] = [
  { value: 'defensible', label: 'Defensible', description: 'Decision is correct given the true meaning' },
  { value: 'not_defensible_language', label: 'Not defensible — language failure', description: 'Misunderstanding directly caused or contributed to wrong outcome' },
  { value: 'not_defensible_reasoning', label: 'Not defensible — reasoning failure', description: 'Language was understood but decision logic is wrong', scopeBOnly: true },
  { value: 'inconclusive', label: 'Inconclusive', description: 'Cannot determine — flag for escalation' },
]

const SEVERITY_LEVELS: { value: CaseSeverity; label: string }[] = [
  { value: 1, label: '1 — Cosmetic' },
  { value: 2, label: '2 — Minor' },
  { value: 3, label: '3 — Moderate' },
  { value: 4, label: '4 — Major' },
  { value: 5, label: '5 — Critical' },
]

export function StepOutcome({
  scope,
  decisionCriteria,
  isLocked,
  onSubmit,
}: {
  scope: VerificationScope
  decisionCriteria: string | null
  isLocked: boolean
  onSubmit: (result: {
    verdict: OutcomeVerdict
    severity: CaseSeverity
    evidenceSummary: string
  }) => void
}) {
  const [verdict, setVerdict] = useState<OutcomeVerdict | null>(null)
  const [severity, setSeverity] = useState<CaseSeverity | null>(null)
  const [evidence, setEvidence] = useState('')

  const filteredVerdicts = VERDICT_OPTIONS.filter(
    (v) => !v.scopeBOnly || scope === 'full',
  )

  const canSubmit = verdict !== null && severity !== null && evidence.trim().length > 0

  function handleSubmit() {
    if (!verdict || !severity) return
    onSubmit({ verdict, severity, evidenceSummary: evidence })
  }

  if (isLocked) {
    return (
      <div className="rounded-lg border border-border/60 bg-muted/50 p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="size-4" />
          <span className="font-medium">Step 2 locked</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Commit Step 1 to unlock outcome evaluation.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {decisionCriteria && scope === 'full' && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">
            <BookOpen className="size-3.5" />
            <span>Decision Criteria (client-provided, read-only)</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {decisionCriteria}
          </p>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Outcome Verdict
        </p>
        <div className="space-y-2">
          {filteredVerdicts.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setVerdict(opt.value)}
              className={cn(
                'flex w-full flex-col items-start rounded-lg border p-3 text-left transition-all',
                verdict === opt.value
                  ? 'border-accent bg-accent/5 shadow-sm'
                  : 'border-border hover:border-border/80 hover:bg-secondary/40',
              )}
            >
              <span className="text-sm font-medium text-foreground">{opt.label}</span>
              <span className="mt-0.5 text-[11px] text-muted-foreground">{opt.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Severity
        </p>
        <div className="flex gap-2">
          {SEVERITY_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setSeverity(level.value)}
              className={cn(
                'flex-1 rounded-md border py-2 text-center text-xs font-medium transition-all',
                severity === level.value
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-border text-muted-foreground hover:border-border/80 hover:text-foreground',
              )}
            >
              {level.value}
            </button>
          ))}
        </div>
        {severity && (
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {SEVERITY_LEVELS.find((l) => l.value === severity)?.label}
          </p>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Evidence Summary
        </p>
        <textarea
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          placeholder="What specifically failed, why it matters, and the consequence..."
          className="w-full resize-y rounded-md border border-border bg-background px-3 py-2.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/60 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 min-h-[100px]"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={cn(
          'inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold transition-all',
          canSubmit
            ? 'bg-accent text-accent-foreground hover:bg-copper-600'
            : 'cursor-not-allowed bg-muted text-muted-foreground',
        )}
      >
        <Send className="size-4" />
        Submit Review
      </button>
    </div>
  )
}
