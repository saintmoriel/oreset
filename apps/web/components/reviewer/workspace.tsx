'use client'

import { useState, useCallback } from 'react'
import { AlertTriangle, Shield, FileCheck2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  ReviewCase,
  Step1Result,
  Step2Result,
  LanguageSegment,
  InterpretationAccuracy,
  MisreadPhrase,
  TemplateField,
  OutcomeVerdict,
  CaseSeverity,
  ReviewSubmission,
} from '@/lib/types/case'
import { MediaPanel } from './media-panel'
import { LanguageTagger } from './language-tagger'
import { StepUnderstanding } from './step-understanding'
import { StepOutcome } from './step-outcome'
import { ReviewTimer, useReviewTimer } from './review-timer'

const DOMAIN_LABELS: Record<string, string> = {
  claims: 'Claims & Payouts',
  lending: 'Lending & Credit',
  government: 'Government & Public Services',
  healthcare: 'Healthcare',
}

const SCOPE_LABELS: Record<string, string> = {
  language: 'Language Verification',
  full: 'Full Decision Verification',
}

export function ReviewerWorkspace({
  reviewCase,
  template,
  onSubmit,
  onEscalate,
}: {
  reviewCase: ReviewCase
  template: { id: string; language: string; domain: string; fields: TemplateField[] } | null
  onSubmit: (submission: ReviewSubmission) => void
  onEscalate: (caseId: string, reason: string) => void
}) {
  const [step1Committed, setStep1Committed] = useState(false)
  const [step1Result, setStep1Result] = useState<Step1Result | null>(null)
  const [step1TimeMs, setStep1TimeMs] = useState(0)
  const [languageSegments, setLanguageSegments] = useState<LanguageSegment[]>([])
  const [replayCount, setReplayCount] = useState(0)
  const [showEscalation, setShowEscalation] = useState(false)
  const [escalationReason, setEscalationReason] = useState('')

  const timer = useReviewTimer()

  const handleReplay = useCallback(() => {
    setReplayCount((c) => c + 1)
  }, [])

  function handleStep1Commit(result: {
    accuracy: InterpretationAccuracy
    misreadPhrases: MisreadPhrase[]
    templateFields: TemplateField[]
  }) {
    setStep1TimeMs(timer.elapsedMs)
    setStep1Result({
      ...result,
      segments: languageSegments,
      committedAt: new Date().toISOString(),
    })
    setStep1Committed(true)
  }

  function handleStep2Submit(result: {
    verdict: OutcomeVerdict
    severity: CaseSeverity
    evidenceSummary: string
  }) {
    if (!step1Result) return
    const submission: ReviewSubmission = {
      caseId: reviewCase.id,
      step1: step1Result,
      step2: {
        ...result,
        submittedAt: new Date().toISOString(),
      },
      totalTimeMs: timer.elapsedMs,
      step1TimeMs,
      step2TimeMs: timer.elapsedMs - step1TimeMs,
      replayCount: replayCount > 0 ? replayCount : undefined,
    }
    onSubmit(submission)
  }

  function handleEscalate() {
    if (!escalationReason.trim()) return
    onEscalate(reviewCase.id, escalationReason)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">{reviewCase.id}</span>
          <span className="rounded bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground">
            {DOMAIN_LABELS[reviewCase.domain] ?? reviewCase.domain}
          </span>
          <span
            className={cn(
              'rounded px-2 py-0.5 text-[11px] font-semibold',
              reviewCase.scope === 'full'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                : 'bg-secondary text-muted-foreground',
            )}
          >
            {SCOPE_LABELS[reviewCase.scope]}
          </span>
          {reviewCase.isDualSolve && (
            <span className="inline-flex items-center gap-1 rounded bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
              <Shield className="size-3" />
              Dual-solve
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ReviewTimer elapsedMs={timer.elapsedMs} isPaused={timer.isPaused} />
          <button
            type="button"
            onClick={() => setShowEscalation(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-warning/50 hover:text-warning"
          >
            <AlertTriangle className="size-3" />
            Escalate
          </button>
        </div>
      </div>

      {/* Escalation Modal */}
      {showEscalation && (
        <div className="border-b border-warning/30 bg-warning/5 px-5 py-4">
          <p className="text-xs font-semibold text-warning mb-2">Escalation Reason</p>
          <div className="flex gap-2">
            <input
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              placeholder="Why is this case being escalated?"
              className="flex-1 rounded-md border border-warning/30 bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:border-warning"
            />
            <button
              type="button"
              onClick={handleEscalate}
              disabled={!escalationReason.trim()}
              className="rounded-md bg-warning px-4 py-2 text-xs font-semibold text-warning-foreground hover:bg-warning/90 disabled:opacity-50"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => { setShowEscalation(false); setEscalationReason('') }}
              className="rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-6 p-5 lg:grid-cols-2">
          {/* Left: Media Panel */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <FileCheck2 className="size-3.5" />
              Case Input — {reviewCase.language}
            </div>
            <MediaPanel input={reviewCase.input} onReplay={handleReplay} />
            <LanguageTagger segments={languageSegments} onChange={setLanguageSegments} />

            {/* AI Decision Context */}
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">AI Decision Made</p>
              <p className="text-sm font-medium text-foreground">{reviewCase.aiDecision}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Outcome: {reviewCase.aiOutcome}
              </p>
            </div>
          </div>

          {/* Right: Evaluation Panel */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full text-[11px] font-bold',
                    step1Committed
                      ? 'bg-success/10 text-success'
                      : 'bg-accent/10 text-accent',
                  )}
                >
                  1
                </span>
                <p className="text-sm font-semibold text-foreground">Understanding Check</p>
              </div>
              <StepUnderstanding
                template={template}
                isCommitted={step1Committed}
                onCommit={handleStep1Commit}
              />
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full text-[11px] font-bold',
                    step1Committed
                      ? 'bg-accent/10 text-accent'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  2
                </span>
                <p className="text-sm font-semibold text-foreground">Outcome Evaluation</p>
              </div>
              <StepOutcome
                scope={reviewCase.scope}
                decisionCriteria={reviewCase.decisionCriteria}
                isLocked={!step1Committed}
                onSubmit={handleStep2Submit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
