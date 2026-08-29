'use client'

import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  TriangleAlert,
  XCircle,
  PenLine,
  Ban,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react'
import {
  ERR_TAGS,
  ERR_TAG_LABELS,
  SEVERITY_LEVELS,
  SEVERITY_LABELS,
  OPERATOR_DECISION_LABELS,
  type ErrTag,
  type Severity,
  type OperatorDecision,
} from '@oreset/shared'
import {
  getOperatorQueue,
  submitOperatorDecision,
  type OperatorQueueItem,
} from '@/lib/api/endpoints/operator'
import { ApiError } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import { ReviewTimer, useReviewTimer } from './review-timer'

const INTERACTIVE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'])

type DecisionConfig = {
  decision: OperatorDecision
  label: string
  shortLabel: string
  icon: typeof CheckCircle2
  color: string
  bgColor: string
  key: string
  requiresErrTag: boolean
  requiresCorrection: boolean
}

const DECISIONS: DecisionConfig[] = [
  {
    decision: 'approved',
    label: 'Approve',
    shortLabel: 'Outcome correct',
    icon: CheckCircle2,
    color: 'text-success',
    bgColor: 'border-success/30 bg-success/5 hover:bg-success/10',
    key: '1',
    requiresErrTag: false,
    requiresCorrection: false,
  },
  {
    decision: 'corrected',
    label: 'Correct & Pass',
    shortLabel: 'Cosmetic flaw, outcome safe',
    icon: PenLine,
    color: 'text-blue-600',
    bgColor: 'border-blue-300/30 bg-blue-50 hover:bg-blue-100/60',
    key: '2',
    requiresErrTag: true,
    requiresCorrection: true,
  },
  {
    decision: 'rejected',
    label: 'Reject & Flag',
    shortLabel: 'Consequential failure',
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'border-destructive/30 bg-destructive/5 hover:bg-destructive/10',
    key: '3',
    requiresErrTag: true,
    requiresCorrection: true,
  },
  {
    decision: 'escalated',
    label: 'Escalate',
    shortLabel: 'Route to Senior QA',
    icon: TriangleAlert,
    color: 'text-warning',
    bgColor: 'border-warning/30 bg-warning/5 hover:bg-warning/10',
    key: '4',
    requiresErrTag: true,
    requiresCorrection: false,
  },
  {
    decision: 'declined',
    label: 'Decline',
    shortLabel: 'Corrupted data',
    icon: Ban,
    color: 'text-navy-500',
    bgColor: 'border-border bg-navy-50 hover:bg-navy-100/60',
    key: '5',
    requiresErrTag: false,
    requiresCorrection: false,
  },
]

export function LegacyReviewItem({
  items,
  onItemsChange,
  onQueueEmpty,
}: {
  items: OperatorQueueItem[]
  onItemsChange: (items: OperatorQueueItem[]) => void
  onQueueEmpty: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Selected decision (null = nothing selected yet)
  const [selected, setSelected] = useState<OperatorDecision | null>(null)

  // Error tagging — multi-select
  const [errTags, setErrTags] = useState<Set<ErrTag>>(new Set())
  const [severity, setSeverity] = useState<Severity>(SEVERITY_LEVELS[0])

  // Notes & corrections
  const [notes, setNotes] = useState('')
  const [correctedTranscript, setCorrectedTranscript] = useState('')
  const [correctedIntent, setCorrectedIntent] = useState('')
  const [correctedOutcome, setCorrectedOutcome] = useState('')

  // Panels
  const [showDetails, setShowDetails] = useState(false)

  const timer = useReviewTimer()

  const item = items[0]
  const selectedConfig = DECISIONS.find((d) => d.decision === selected)
  const needsErrTag = selectedConfig?.requiresErrTag ?? false
  const needsCorrection = selectedConfig?.requiresCorrection ?? false

  const canSubmit =
    selected !== null &&
    !submitting &&
    (!needsErrTag || errTags.size > 0) &&
    (!needsCorrection || correctedOutcome.trim())

  function resetForm() {
    setSelected(null)
    setErrTags(new Set())
    setSeverity(SEVERITY_LEVELS[0])
    setNotes('')
    setCorrectedTranscript('')
    setCorrectedIntent('')
    setCorrectedOutcome('')
    setShowDetails(false)
    timer.reset()
  }

  function toggleErrTag(tag: ErrTag) {
    setErrTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  async function handleSubmit() {
    if (!item || !selected || !canSubmit) return
    setSubmitting(true)
    setError(null)

    const primaryErrTag = errTags.size > 0 ? [...errTags][0] : undefined

    try {
      await submitOperatorDecision(item.id, {
        decision: selected,
        errTag: primaryErrTag,
        severity: needsErrTag ? severity : undefined,
        notes: notes.trim() || undefined,
        correctedTranscript: correctedTranscript.trim() || undefined,
        correctedIntent: correctedIntent.trim() || undefined,
        correctedOutcome: correctedOutcome.trim() || undefined,
        reviewTimeMs: timer.elapsedMs,
      })
      const refreshed = await getOperatorQueue()
      if (refreshed.items.length === 0) {
        onQueueEmpty()
      } else {
        onItemsChange(refreshed.items)
        resetForm()
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit that decision. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const active = document.activeElement
      if (active && INTERACTIVE_TAGS.has(active.tagName)) return
      if (!item || submitting) return

      if (e.key === 'Enter' && selected && canSubmit) {
        handleSubmit()
        return
      }

      if (e.key === 'Escape') {
        setSelected(null)
        return
      }

      const decision = DECISIONS.find((d) => d.key === e.key)
      if (decision) {
        setSelected(decision.decision)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, selected, submitting, canSubmit])

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="cx-label text-navy-400">{items.length} remaining</p>
          <ReviewTimer elapsedMs={timer.elapsedMs} isPaused={timer.isPaused} />
        </div>
        <p className="cx-mono-meta text-navy-400">{item.externalRef}</p>
      </div>

      <div className="flex items-center justify-between mt-1.5">
        <h1 className="cx-page-title text-navy-900">{item.clientName}</h1>
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="cx-meta flex items-center gap-1 text-navy-400 hover:text-navy-600"
        >
          {showDetails ? 'Hide' : 'Details'}
          {showDetails ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        </button>
      </div>

      {showDetails && (
        <div className="mt-2 rounded-lg border border-border bg-navy-50 p-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-navy-400">Client</p>
              <p className="cx-body text-navy-800">{item.clientName}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-navy-400">Reference</p>
              <p className="cx-mono-meta text-navy-800">{item.externalRef}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-navy-400">Submitted</p>
              <p className="cx-meta text-navy-800">{new Date(item.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Case Content */}
      <div className="cx-card mt-4 p-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-navy-400 mb-3">
          AI Output for Review
        </p>
        <p className="cx-body text-navy-800 leading-relaxed">{item.content}</p>
      </div>

      {error && (
        <p className="mt-3 cx-meta text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* 5 Decision Buttons */}
      <div className="mt-6">
        <p className="text-[11px] font-medium uppercase tracking-wider text-navy-400 mb-3">Decision</p>
        <div className="grid gap-2 sm:grid-cols-5">
          {DECISIONS.map((d) => {
            const Icon = d.icon
            const isSelected = selected === d.decision
            return (
              <button
                key={d.decision}
                type="button"
                onClick={() => setSelected(d.decision)}
                disabled={submitting}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-center transition-all disabled:opacity-50',
                  isSelected
                    ? `${d.bgColor} ring-2 ring-current/20`
                    : 'border-border bg-card hover:bg-navy-50',
                )}
              >
                <Icon className={cn('size-5', isSelected ? d.color : 'text-navy-400')} />
                <span className={cn('text-xs font-semibold', isSelected ? d.color : 'text-navy-700')}>
                  {d.label}
                </span>
                <span className="text-[10px] text-navy-400 leading-tight">{d.shortLabel}</span>
                <kbd className="mt-0.5 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-navy-300">
                  {d.key}
                </kbd>
              </button>
            )
          })}
        </div>
      </div>

      {/* Error Tagging Panel — shows for corrected, rejected, escalated */}
      {selected && needsErrTag && (
        <div className="mt-4 rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-navy-900 mb-1">Tag errors found</p>
          <p className="cx-meta text-navy-400 mb-3">
            Select all that apply. Multiple errors can exist in one case.
          </p>

          <div className="space-y-2">
            {ERR_TAGS.map((tag) => {
              const isActive = errTags.has(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleErrTag(tag)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                    isActive ? 'border-accent/40 bg-accent/5' : 'border-border bg-background hover:bg-navy-50',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded border text-[10px] font-bold',
                      isActive ? 'border-accent bg-accent text-white' : 'border-navy-300 text-navy-400',
                    )}
                  >
                    {isActive ? '✓' : ''}
                  </span>
                  <span className="cx-mono-meta font-semibold text-navy-700">{tag}</span>
                  <span className="cx-meta text-navy-500">{ERR_TAG_LABELS[tag]}</span>
                </button>
              )
            })}
          </div>

          {/* Severity */}
          <p className="mt-4 text-sm font-semibold text-navy-900 mb-2">Severity</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {SEVERITY_LEVELS.map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverity(sev)}
                className={cn(
                  'flex flex-col gap-0.5 rounded-lg border p-3 text-left transition-colors',
                  severity === sev ? 'border-warning/50 bg-warning/10' : 'border-border bg-background hover:bg-navy-50',
                )}
              >
                <span className="cx-mono-meta font-semibold text-navy-800">{sev}</span>
                <span className="text-[11px] text-navy-500">{SEVERITY_LABELS[sev]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ground-Truth Correction — shows for corrected and rejected */}
      {selected && needsCorrection && (
        <div className="mt-4 rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-navy-900 mb-1">Ground-truth correction</p>
          <p className="cx-meta text-navy-400 mb-3">
            Record what the correct interpretation and outcome should have been.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-navy-600">Corrected transcript</label>
              <textarea
                value={correctedTranscript}
                onChange={(e) => setCorrectedTranscript(e.target.value)}
                placeholder="What the user actually said..."
                rows={2}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-navy-900 outline-none placeholder:text-navy-300 focus-visible:border-accent resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-navy-600">Corrected intent & entities</label>
              <textarea
                value={correctedIntent}
                onChange={(e) => setCorrectedIntent(e.target.value)}
                placeholder="e.g. intent: dispute_charge, amount: 20000"
                rows={2}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-navy-900 outline-none placeholder:text-navy-300 focus-visible:border-accent resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-navy-600">
                Corrected decision outcome <span className="text-destructive">*</span>
              </label>
              <textarea
                value={correctedOutcome}
                onChange={(e) => setCorrectedOutcome(e.target.value)}
                placeholder="The action the AI should have executed..."
                rows={2}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-navy-900 outline-none placeholder:text-navy-300 focus-visible:border-accent resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Notes — always available when a decision is selected */}
      {selected && (
        <div className="mt-4">
          <label className="text-xs font-medium text-navy-600">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional context about this decision..."
            rows={2}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-navy-900 outline-none placeholder:text-navy-300 focus-visible:border-accent resize-none"
          />
        </div>
      )}

      {/* Submit */}
      {selected && (
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="cx-body font-medium text-navy-500 hover:text-navy-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              'inline-flex h-11 items-center justify-center gap-2 rounded-md px-6 text-sm font-semibold text-white disabled:opacity-50',
              selected === 'approved' && 'bg-success hover:bg-success/90',
              selected === 'corrected' && 'bg-blue-600 hover:bg-blue-700',
              selected === 'rejected' && 'bg-destructive hover:bg-destructive/90',
              selected === 'escalated' && 'bg-warning hover:bg-warning/90 text-warning-foreground',
              selected === 'declined' && 'bg-navy-600 hover:bg-navy-700',
            )}
          >
            {submitting ? 'Submitting…' : `Submit: ${selectedConfig?.label}`}
          </button>
        </div>
      )}

      {/* Keyboard shortcut hint */}
      <p className="mt-3 cx-mono-meta text-navy-300">
        1–5 select decision · Enter submit · Esc cancel
      </p>
    </>
  )
}
