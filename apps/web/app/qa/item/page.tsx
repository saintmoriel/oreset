'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Play, TriangleAlert, XCircle } from 'lucide-react'
import { QueueShell } from '@/components/shared/queue-shell'
import { QA_QUEUE_ITEMS, DEFECT_TAGS } from '@/lib/qa-mock-data'
import { cn } from '@/lib/utils'

const BARS = [6, 14, 22, 12, 28, 18, 9, 24, 16, 30, 14, 8, 20, 26, 11]

function QaItemContent() {
  const router = useRouter()
  const params = useSearchParams()

  const remaining = Number(params.get('remaining') ?? QA_QUEUE_ITEMS.length)
  const approved = Number(params.get('approved') ?? 0)
  const rejected = Number(params.get('rejected') ?? 0)

  const [defectTag, setDefectTag] = useState<string>(DEFECT_TAGS[0].code)
  const [showRejectPanel, setShowRejectPanel] = useState(false)

  const item = QA_QUEUE_ITEMS[QA_QUEUE_ITEMS.length - remaining] ?? QA_QUEUE_ITEMS[0]

  function advance(nextApproved: number, nextRejected: number) {
    const nextRemaining = remaining - 1
    const query = `approved=${nextApproved}&rejected=${nextRejected}`
    if (nextRemaining <= 0) {
      router.push(`/qa/complete?${query}`)
    } else {
      router.push(`/qa/item?remaining=${nextRemaining}&${query}`)
    }
  }

  return (
    <QueueShell badge="Origin QA" signOutHref="/qa" step={1}>
      <div className="card-surface-raised p-8 sm:p-10">
        <div className="flex items-center justify-between">
          <p className="text-eyebrow text-accent">
            Item {QA_QUEUE_ITEMS.length - remaining + 1} of {QA_QUEUE_ITEMS.length}
          </p>
          <p className="font-mono text-caption text-muted-foreground">{item.id}</p>
        </div>

        <h1 className="text-h2 mt-2 text-balance text-foreground">Manual review</h1>

        {item.flag && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 p-4 text-body-sm text-warning">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <span>
              Automated Validation note: <strong className="font-semibold">{item.flag}</strong> —
              borderline confidence. Listen closely before deciding.
            </span>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-border bg-paper-100 p-6 text-center">
          <p className="font-display text-h4 text-foreground" lang="yo">
            {item.prompt}
          </p>
        </div>

        <div className="mt-6 flex items-center gap-4 rounded-xl border border-border bg-paper-100 p-5">
          <button
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-navy-800 text-white hover:bg-navy-700"
            aria-label="Play recording"
          >
            <Play className="size-5" />
          </button>
          <div className="flex h-9 flex-1 items-end gap-0.5" aria-hidden="true">
            {BARS.map((h, i) => (
              <span key={i} className="flex-1 rounded-full bg-accent/50" style={{ height: `${h}px` }} />
            ))}
          </div>
          <span className="text-body-sm tabular text-muted-foreground">{item.duration}</span>
        </div>

        {!showRejectPanel ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => advance(approved + 1, rejected)}
              className="flex items-center justify-center gap-2 rounded-md border border-success/30 bg-success/5 px-4 py-3 text-sm font-semibold text-success hover:bg-success/10"
            >
              <CheckCircle2 className="size-4" />
              Approve
            </button>
            <button
              onClick={() => setShowRejectPanel(true)}
              className="flex items-center justify-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10"
            >
              <XCircle className="size-4" />
              Reject
            </button>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
            <p className="text-body-sm font-semibold text-foreground">Tag the defect</p>
            <div className="mt-3 space-y-2">
              {DEFECT_TAGS.map((tag) => (
                <label
                  key={tag.code}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-body-sm transition-colors',
                    defectTag === tag.code ? 'border-destructive/50 bg-destructive/10' : 'border-border bg-background',
                  )}
                >
                  <input
                    type="radio"
                    name="defect"
                    checked={defectTag === tag.code}
                    onChange={() => setDefectTag(tag.code)}
                    className="size-4 accent-destructive"
                  />
                  <span className="font-mono font-semibold text-foreground">{tag.code}</span>
                  <span className="text-muted-foreground">{tag.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowRejectPanel(false)}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border text-sm font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => advance(approved, rejected + 1)}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-destructive/90 text-sm font-semibold text-destructive-foreground hover:bg-destructive"
              >
                Confirm reject · {defectTag}
              </button>
            </div>
          </div>
        )}
      </div>
    </QueueShell>
  )
}

export default function QaItemPage() {
  return (
    <Suspense>
      <QaItemContent />
    </Suspense>
  )
}
