'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { CheckCircle2, XCircle, Target, Trophy, Loader2 } from 'lucide-react'
import { OperatorAppShell } from '@/components/operator/operator-app-shell'
import { StatusTag } from '@/components/capture/status-tag'
import { cn } from '@/lib/utils'
import {
  getNextCalibrationCase,
  submitCalibrationAttempt,
  getMyCalibration,
} from '@/lib/api/endpoints/calibration'
import type { CalibrationCase, CalibrationFeedback, CalibrationAttempt } from '@/lib/api/endpoints/calibration'
import { OPERATOR_DECISION_LABELS, ERR_TAG_LABELS, SEVERITY_LABELS } from '@oreset/shared'
import type { OperatorDecision, ErrTag, Severity } from '@oreset/shared'

type Phase = 'loading' | 'ready' | 'reviewing' | 'feedback' | 'complete'

export default function CalibrationPage() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [currentCase, setCurrentCase] = useState<CalibrationCase | null>(null)
  const [feedback, setFeedback] = useState<CalibrationFeedback | null>(null)
  const [history, setHistory] = useState<CalibrationAttempt[]>([])
  const [stats, setStats] = useState<{ totalAttempts: number; passed: number; failed: number; avgScore: number | null } | null>(null)
  const [isPending, startTransition] = useTransition()

  // Review form state
  const [decision, setDecision] = useState<OperatorDecision | null>(null)
  const [errTag, setErrTag] = useState<ErrTag | null>(null)
  const [severity, setSeverity] = useState<Severity | null>(null)
  const [notes, setNotes] = useState('')
  const [startTime] = useState(Date.now())

  const loadNext = useCallback(() => {
    startTransition(async () => {
      const [nextRes, historyRes] = await Promise.all([
        getNextCalibrationCase(),
        getMyCalibration(),
      ])
      setHistory(historyRes.attempts)
      setStats({ totalAttempts: historyRes.totalAttempts, passed: historyRes.passed, failed: historyRes.failed, avgScore: historyRes.avgScore })

      if (nextRes.calibrationCase) {
        setCurrentCase(nextRes.calibrationCase)
        setPhase('reviewing')
        setDecision(null)
        setErrTag(null)
        setSeverity(null)
        setNotes('')
        setFeedback(null)
      } else {
        setPhase('complete')
      }
    })
  }, [])

  useEffect(() => { loadNext() }, [loadNext])

  function handleSubmit() {
    if (!currentCase || !decision) return
    startTransition(async () => {
      const res = await submitCalibrationAttempt({
        calibrationCaseId: currentCase.id,
        decision,
        errTag: errTag ?? undefined,
        severity: severity ?? undefined,
        notes: notes || undefined,
        reviewTimeMs: Date.now() - startTime,
      })
      setFeedback(res.feedback)
      setPhase('feedback')
    })
  }

  const DECISIONS: { value: OperatorDecision; color: string }[] = [
    { value: 'approved', color: 'border-success/50 bg-success/5' },
    { value: 'corrected', color: 'border-accent/50 bg-accent/5' },
    { value: 'rejected', color: 'border-destructive/50 bg-destructive/5' },
    { value: 'escalated', color: 'border-warning/50 bg-warning/5' },
    { value: 'declined', color: 'border-navy-200 bg-navy-50' },
  ]

  return (
    <OperatorAppShell>
      <div className="flex items-center gap-3">
        <Target className="size-5 text-accent" />
        <div>
          <p className="cx-label text-navy-400">Quality Assurance</p>
          <h1 className="cx-page-title text-navy-900">Calibration</h1>
        </div>
      </div>
      <p className="cx-body mt-2 max-w-lg text-navy-500">
        Gold-standard cases with known correct answers. Practice your review skills
        and get instant feedback on your accuracy.
      </p>

      {/* Stats bar */}
      {stats && stats.totalAttempts > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="cx-card flex items-center gap-2 px-3 py-2">
            <Trophy className="size-4 text-accent" />
            <span className="cx-mono-meta font-semibold text-navy-800">{stats.passed}/{stats.totalAttempts}</span>
            <span className="cx-meta text-navy-400">passed</span>
          </div>
          {stats.avgScore !== null && (
            <div className="cx-card flex items-center gap-2 px-3 py-2">
              <span className="cx-mono-meta font-semibold text-navy-800">{stats.avgScore}%</span>
              <span className="cx-meta text-navy-400">avg score</span>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {phase === 'loading' && (
        <div className="mt-8 flex justify-center">
          <Loader2 className="size-6 animate-spin text-navy-400" />
        </div>
      )}

      {/* All complete */}
      {phase === 'complete' && (
        <div className="cx-card mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-success/10">
            <CheckCircle2 className="size-6 text-success" />
          </span>
          <p className="cx-body font-semibold text-navy-900">All calibration cases completed</p>
          <p className="cx-meta max-w-sm text-navy-500">
            You've reviewed all available gold-standard cases. New cases will appear here when added by the QA team.
          </p>
        </div>
      )}

      {/* Active review */}
      {phase === 'reviewing' && currentCase && (
        <div className="cx-card mt-6 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <StatusTag tone="neutral">Calibration Case</StatusTag>
            {currentCase.domain && (
              <span className="rounded bg-navy-100 px-1.5 py-0.5 text-[10px] font-semibold text-navy-500 uppercase">
                {currentCase.domain}
              </span>
            )}
            {currentCase.language && (
              <span className="rounded bg-navy-100 px-1.5 py-0.5 text-[10px] font-semibold text-navy-500">
                {currentCase.language}
              </span>
            )}
          </div>

          <h2 className="cx-title text-navy-900">{currentCase.title}</h2>
          <div className="mt-3 rounded-lg border border-border bg-navy-50 p-4">
            <p className="cx-body text-navy-800 whitespace-pre-wrap leading-relaxed">
              {currentCase.content}
            </p>
          </div>

          {/* Decision buttons */}
          <div className="mt-5">
            <p className="cx-meta font-medium text-navy-500 mb-2">Your Decision</p>
            <div className="grid gap-2 sm:grid-cols-5">
              {DECISIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDecision(d.value)}
                  className={cn(
                    'rounded-lg border p-3 text-left cx-fade',
                    decision === d.value ? d.color : 'border-border bg-card hover:bg-navy-50/40',
                  )}
                >
                  <p className="cx-meta font-semibold text-navy-800 capitalize">{d.value}</p>
                  <p className="cx-mono-meta text-navy-400 mt-0.5 line-clamp-2">
                    {OPERATOR_DECISION_LABELS[d.value].split(' — ')[1]}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Error tag + severity */}
          {decision && (decision === 'rejected' || decision === 'escalated') && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="cx-meta font-medium text-navy-500 mb-1.5">Error Tag</p>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.entries(ERR_TAG_LABELS) as [ErrTag, string][]).map(([tag, label]) => (
                    <button
                      key={tag}
                      onClick={() => setErrTag(errTag === tag ? null : tag)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 cx-meta cx-fade',
                        errTag === tag ? 'border-accent/50 bg-accent/10 text-accent' : 'border-border bg-card text-navy-600',
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="cx-meta font-medium text-navy-500 mb-1.5">Severity</p>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.entries(SEVERITY_LABELS) as [Severity, string][]).map(([sev, label]) => (
                    <button
                      key={sev}
                      onClick={() => setSeverity(severity === sev ? null : sev)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 cx-meta cx-fade',
                        severity === sev ? 'border-accent/50 bg-accent/10 text-accent' : 'border-border bg-card text-navy-600',
                      )}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mt-4">
            <label className="cx-meta font-medium text-navy-500 mb-1.5 block">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="cx-body w-full rounded-lg border border-border bg-card px-3 py-2 text-navy-800 placeholder:text-navy-300 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              placeholder="Reasoning for your decision…"
            />
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!decision || isPending}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-5 cx-body font-semibold text-white hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40 cx-fade"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Submit Answer
            </button>
          </div>
        </div>
      )}

      {/* Feedback */}
      {phase === 'feedback' && feedback && (
        <div className="cx-card mt-6 p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            {feedback.result === 'pass' ? (
              <>
                <span className="flex size-10 items-center justify-center rounded-xl bg-success/10">
                  <CheckCircle2 className="size-5 text-success" />
                </span>
                <div>
                  <p className="cx-body font-semibold text-success">Correct — {feedback.score}%</p>
                  <p className="cx-meta text-navy-500">Your answer matched the gold standard</p>
                </div>
              </>
            ) : (
              <>
                <span className="flex size-10 items-center justify-center rounded-xl bg-destructive/10">
                  <XCircle className="size-5 text-destructive" />
                </span>
                <div>
                  <p className="cx-body font-semibold text-destructive">Incorrect — {feedback.score}%</p>
                  <p className="cx-meta text-navy-500">Review the expected answer below</p>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-navy-50 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-navy-400 mb-1">Expected Decision</p>
              <p className="cx-body font-semibold text-navy-800 capitalize">{feedback.expectedDecision}</p>
              {feedback.expectedErrTag && (
                <p className="cx-meta text-navy-500 mt-1">Error: {feedback.expectedErrTag}</p>
              )}
              {feedback.expectedSeverity && (
                <p className="cx-meta text-navy-500">Severity: {feedback.expectedSeverity}</p>
              )}
            </div>
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-accent mb-1">Explanation</p>
              <p className="cx-body text-navy-800 leading-relaxed">{feedback.explanation}</p>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={loadNext}
              disabled={isPending}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-5 cx-body font-semibold text-white hover:bg-accent/90 disabled:opacity-40 cx-fade"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Next Case
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-8">
          <h2 className="cx-title text-navy-900 mb-3">Your History</h2>
          <div className="space-y-2">
            {history.map((a) => (
              <div key={a.id} className="cx-card flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="cx-body font-medium text-navy-800 truncate">
                    {a.calibrationCase?.title ?? 'Case'}
                  </p>
                  <p className="cx-meta text-navy-400">
                    Your answer: <span className="capitalize">{a.decision}</span>
                    {a.calibrationCase?.expectedDecision && (
                      <> · Expected: <span className="capitalize">{a.calibrationCase.expectedDecision}</span></>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="cx-mono-meta font-semibold text-navy-800">
                    {Math.round(a.score * 100)}%
                  </span>
                  {a.result === 'pass' ? (
                    <StatusTag tone="success">Pass</StatusTag>
                  ) : (
                    <StatusTag tone="destructive">Fail</StatusTag>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </OperatorAppShell>
  )
}
