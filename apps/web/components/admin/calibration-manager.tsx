'use client'

import { useState, useTransition } from 'react'
import { ChevronDown, ChevronUp, Plus, Archive } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusTag } from '@/components/capture/status-tag'
import { OPERATOR_DECISION_LABELS, ERR_TAG_LABELS, SEVERITY_LABELS, OPERATOR_DECISIONS, ERR_TAGS, SEVERITY_LEVELS } from '@oreset/shared'
import type { OperatorDecision, ErrTag, Severity } from '@oreset/shared'
import { createCalibrationCase, retireCalibrationCase } from '@/lib/api/endpoints/calibration'
import type { CalibrationCaseFull } from '@/lib/api/endpoints/calibration'

export function CalibrationManager({ initialCases }: { initialCases: CalibrationCaseFull[] }) {
  const [cases, setCases] = useState(initialCases)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [expectedDecision, setExpectedDecision] = useState<OperatorDecision>('approved')
  const [expectedErrTag, setExpectedErrTag] = useState<ErrTag | null>(null)
  const [expectedSeverity, setExpectedSeverity] = useState<Severity | null>(null)
  const [expectedOutcome, setExpectedOutcome] = useState('')
  const [explanation, setExplanation] = useState('')
  const [domain, setDomain] = useState('')
  const [language, setLanguage] = useState('en')

  function resetForm() {
    setTitle('')
    setContent('')
    setExpectedDecision('approved')
    setExpectedErrTag(null)
    setExpectedSeverity(null)
    setExpectedOutcome('')
    setExplanation('')
    setDomain('')
    setLanguage('en')
  }

  function handleCreate() {
    if (!title || !content || !explanation) return
    startTransition(async () => {
      const res = await createCalibrationCase({
        title,
        content,
        expectedDecision,
        expectedErrTag: expectedErrTag ?? undefined,
        expectedSeverity: expectedSeverity ?? undefined,
        expectedOutcome: expectedOutcome || undefined,
        explanation,
        domain: domain || undefined,
        language: language || undefined,
      })
      setCases((prev) => [res.calibrationCase, ...prev])
      resetForm()
      setShowForm(false)
    })
  }

  function handleRetire(id: string) {
    startTransition(async () => {
      const res = await retireCalibrationCase(id)
      setCases((prev) => prev.map((c) => (c.id === id ? res.calibrationCase : c)))
    })
  }

  const activeCases = cases.filter((c) => c.status === 'active')
  const retiredCases = cases.filter((c) => c.status === 'retired')

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="cx-title text-navy-900">Gold-Standard Cases</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 cx-body font-semibold text-white hover:bg-accent/90 cx-fade"
        >
          <Plus className="size-4" />
          New Case
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="cx-card mb-4 p-5 space-y-4">
          <p className="cx-body font-semibold text-navy-900">Create Gold-Standard Case</p>

          <div>
            <label className="cx-meta font-medium text-navy-500 mb-1 block">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="cx-body w-full rounded-lg border border-border bg-card px-3 py-2 text-navy-800 focus:border-accent/50 focus:outline-none"
              placeholder="e.g. Yorùbá loan approval — dialect misparsing"
            />
          </div>

          <div>
            <label className="cx-meta font-medium text-navy-500 mb-1 block">Case Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="cx-body w-full rounded-lg border border-border bg-card px-3 py-2 text-navy-800 focus:border-accent/50 focus:outline-none"
              placeholder="The full case content that operators will review…"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="cx-meta font-medium text-navy-500 mb-1 block">Expected Decision</label>
              <select
                value={expectedDecision}
                onChange={(e) => setExpectedDecision(e.target.value as OperatorDecision)}
                className="cx-body w-full rounded-lg border border-border bg-card px-3 py-2 text-navy-800"
              >
                {OPERATOR_DECISIONS.map((d) => (
                  <option key={d} value={d}>{d} — {OPERATOR_DECISION_LABELS[d].split(' — ')[1]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="cx-meta font-medium text-navy-500 mb-1 block">Domain</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="cx-body w-full rounded-lg border border-border bg-card px-3 py-2 text-navy-800"
              >
                <option value="">None</option>
                <option value="claims">Claims</option>
                <option value="lending">Lending</option>
                <option value="government">Government</option>
                <option value="healthcare">Healthcare</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="cx-meta font-medium text-navy-500 mb-1 block">Expected Error Tag</label>
              <select
                value={expectedErrTag ?? ''}
                onChange={(e) => setExpectedErrTag((e.target.value || null) as ErrTag | null)}
                className="cx-body w-full rounded-lg border border-border bg-card px-3 py-2 text-navy-800"
              >
                <option value="">None</option>
                {ERR_TAGS.map((tag) => (
                  <option key={tag} value={tag}>{tag} — {ERR_TAG_LABELS[tag]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="cx-meta font-medium text-navy-500 mb-1 block">Expected Severity</label>
              <select
                value={expectedSeverity ?? ''}
                onChange={(e) => setExpectedSeverity((e.target.value || null) as Severity | null)}
                className="cx-body w-full rounded-lg border border-border bg-card px-3 py-2 text-navy-800"
              >
                <option value="">None</option>
                {SEVERITY_LEVELS.map((sev) => (
                  <option key={sev} value={sev}>{sev} — {SEVERITY_LABELS[sev]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="cx-meta font-medium text-navy-500 mb-1 block">Language</label>
            <input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="cx-body w-full rounded-lg border border-border bg-card px-3 py-2 text-navy-800 focus:border-accent/50 focus:outline-none"
              placeholder="en"
            />
          </div>

          <div>
            <label className="cx-meta font-medium text-navy-500 mb-1 block">Expected Outcome (optional)</label>
            <input
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              className="cx-body w-full rounded-lg border border-border bg-card px-3 py-2 text-navy-800 focus:border-accent/50 focus:outline-none"
              placeholder="The correct outcome for this case"
            />
          </div>

          <div>
            <label className="cx-meta font-medium text-navy-500 mb-1 block">Explanation (shown after attempt)</label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={3}
              className="cx-body w-full rounded-lg border border-border bg-card px-3 py-2 text-navy-800 focus:border-accent/50 focus:outline-none"
              placeholder="Why this is the correct answer — shown to operators after they submit…"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => { resetForm(); setShowForm(false) }}
              className="inline-flex h-9 items-center rounded-lg border border-border px-4 cx-body font-medium text-navy-600 hover:bg-navy-50 cx-fade"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!title || !content || !explanation || isPending}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 cx-body font-semibold text-white hover:bg-accent/90 disabled:opacity-40 cx-fade"
            >
              Create Case
            </button>
          </div>
        </div>
      )}

      {/* Case list */}
      <p className="cx-meta text-navy-400 mb-2">{activeCases.length} active · {retiredCases.length} retired</p>

      {cases.length === 0 ? (
        <p className="cx-body text-navy-400">No calibration cases yet. Create one to get started.</p>
      ) : (
        <div className="space-y-2">
          {cases.map((c) => {
            const isExpanded = expandedId === c.id
            return (
              <div
                key={c.id}
                className={cn(
                  'rounded-xl border bg-card overflow-hidden',
                  c.status === 'retired' ? 'opacity-60' : '',
                )}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                  className="flex w-full items-start justify-between gap-4 p-4 text-left hover:bg-navy-50/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="cx-body font-semibold text-navy-800">{c.title}</span>
                      <StatusTag tone={c.status === 'active' ? 'success' : 'neutral'}>
                        {c.status}
                      </StatusTag>
                      <span className="rounded bg-navy-100 px-1.5 py-0.5 text-[10px] font-semibold text-navy-500 capitalize">
                        {c.expectedDecision}
                      </span>
                      {c.domain && (
                        <span className="rounded bg-navy-100 px-1.5 py-0.5 text-[10px] font-semibold text-navy-500 uppercase">
                          {c.domain}
                        </span>
                      )}
                    </div>
                    <p className="cx-meta mt-1 text-navy-400">
                      Created {new Date(c.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                      {c.createdByUser?.displayName && ` by ${c.createdByUser.displayName}`}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="size-4 shrink-0 text-navy-400" />
                  ) : (
                    <ChevronDown className="size-4 shrink-0 text-navy-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                    <div className="rounded-lg border border-border bg-navy-50 p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-navy-400 mb-1">Content</p>
                      <p className="cx-body text-navy-800 whitespace-pre-wrap">{c.content}</p>
                    </div>
                    <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-accent mb-1">Expected Answer</p>
                      <p className="cx-body text-navy-800">
                        <span className="font-semibold capitalize">{c.expectedDecision}</span>
                        {c.expectedErrTag && <> · {c.expectedErrTag}</>}
                        {c.expectedSeverity && <> · {c.expectedSeverity}</>}
                      </p>
                      {c.expectedOutcome && (
                        <p className="cx-meta mt-1 text-navy-600">Outcome: {c.expectedOutcome}</p>
                      )}
                    </div>
                    <div className="rounded-lg border border-border bg-background p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-navy-400 mb-1">Explanation</p>
                      <p className="cx-body text-navy-800">{c.explanation}</p>
                    </div>
                    {c.status === 'active' && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleRetire(c.id)}
                          disabled={isPending}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 cx-meta font-medium text-navy-500 hover:bg-navy-50 disabled:opacity-40 cx-fade"
                        >
                          <Archive className="size-3.5" />
                          Retire
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
