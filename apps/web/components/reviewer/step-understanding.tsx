'use client'

import { useState } from 'react'
import { Plus, X, CheckCircle2, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  InterpretationAccuracy,
  MisreadPhrase,
  TemplateField,
  StructuredTemplate,
} from '@/lib/types/case'

const ACCURACY_OPTIONS: { value: InterpretationAccuracy; label: string; description: string }[] = [
  { value: 'correct', label: 'Correct', description: 'AI interpretation matches the original meaning' },
  { value: 'minor', label: 'Minor error', description: 'Small inaccuracy, overall meaning preserved' },
  { value: 'major', label: 'Major error', description: 'Meaning significantly altered' },
  { value: 'critical', label: 'Critical error', description: 'Meaning inverted or entirely lost' },
]

export function StepUnderstanding({
  template,
  isCommitted,
  onCommit,
}: {
  template: StructuredTemplate | null
  isCommitted: boolean
  onCommit: (result: {
    accuracy: InterpretationAccuracy
    misreadPhrases: MisreadPhrase[]
    templateFields: TemplateField[]
  }) => void
}) {
  const [accuracy, setAccuracy] = useState<InterpretationAccuracy | null>(null)
  const [misreadPhrases, setMisreadPhrases] = useState<MisreadPhrase[]>([
    { id: '1', original: '', correctMeaning: '' },
  ])
  const [templateFields, setTemplateFields] = useState<TemplateField[]>(
    template?.fields ?? [],
  )

  function addPhrase() {
    setMisreadPhrases((prev) => [
      ...prev,
      { id: String(Date.now()), original: '', correctMeaning: '' },
    ])
  }

  function removePhrase(id: string) {
    setMisreadPhrases((prev) => prev.filter((p) => p.id !== id))
  }

  function updatePhrase(id: string, patch: Partial<MisreadPhrase>) {
    setMisreadPhrases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    )
  }

  function updateTemplateField(id: string, value: string) {
    setTemplateFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value } : f)),
    )
  }

  function handleCommit() {
    if (!accuracy) return
    onCommit({
      accuracy,
      misreadPhrases: misreadPhrases.filter((p) => p.original.trim()),
      templateFields,
    })
  }

  const canCommit = accuracy !== null

  if (isCommitted) {
    return (
      <div className="rounded-lg border border-success/30 bg-success/5 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-success">
          <CheckCircle2 className="size-4" />
          Step 1 committed
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Understanding check locked. Proceeding to outcome evaluation.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Interpretation Accuracy
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {ACCURACY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAccuracy(opt.value)}
              className={cn(
                'flex flex-col items-start rounded-lg border p-3 text-left transition-all',
                accuracy === opt.value
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

      {accuracy && accuracy !== 'correct' && (
        <>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Key Phrases Misread
            </p>
            <div className="space-y-2">
              {misreadPhrases.map((phrase) => (
                <div key={phrase.id} className="flex gap-2">
                  <input
                    value={phrase.original}
                    onChange={(e) => updatePhrase(phrase.id, { original: e.target.value })}
                    placeholder="Original phrase"
                    className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
                  />
                  <span className="flex items-center text-xs text-muted-foreground">→</span>
                  <input
                    value={phrase.correctMeaning}
                    onChange={(e) => updatePhrase(phrase.id, { correctMeaning: e.target.value })}
                    placeholder="Correct meaning"
                    className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
                  />
                  {misreadPhrases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhrase(phrase.id)}
                      className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addPhrase}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-copper-600"
            >
              <Plus className="size-3.5" />
              Add phrase
            </button>
          </div>

          {templateFields.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Correct Interpretation — {template?.language} · {template?.domain}
              </p>
              <div className="space-y-3 rounded-lg border border-border bg-card p-4">
                {templateFields.map((field) => (
                  <div key={field.id}>
                    <label className="text-xs font-medium text-foreground">{field.label}</label>
                    {field.type === 'select' && field.options ? (
                      <select
                        value={field.value}
                        onChange={(e) => updateTemplateField(field.id, e.target.value)}
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-accent"
                      >
                        <option value="">Select...</option>
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={field.value}
                        onChange={(e) => updateTemplateField(field.id, e.target.value)}
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <button
        type="button"
        onClick={handleCommit}
        disabled={!canCommit}
        className={cn(
          'inline-flex h-10 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold transition-all',
          canCommit
            ? 'bg-foreground text-background hover:bg-foreground/90'
            : 'cursor-not-allowed bg-muted text-muted-foreground',
        )}
      >
        <Lock className="size-3.5" />
        Commit Step 1
      </button>
    </div>
  )
}
