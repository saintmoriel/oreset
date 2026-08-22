'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Loader2, Play, TriangleAlert, XCircle } from 'lucide-react'
import { ERR_TAGS, ERR_TAG_LABELS, type ErrTag } from '@oreset/shared'
import { QueueShell } from '@/components/shared/queue-shell'
import { getQaQueue, submitQaDecision, type QaQueueItem } from '@/lib/api/endpoints/qa'
import { ApiError } from '@/lib/api/client'
import { cn } from '@/lib/utils'

function QaItemContent() {
  const router = useRouter()
  const params = useSearchParams()
  const approved = Number(params.get('approved') ?? 0)
  const rejected = Number(params.get('rejected') ?? 0)

  const [items, setItems] = useState<QaQueueItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [defectTag, setDefectTag] = useState<ErrTag>(ERR_TAGS[0])
  const [showRejectPanel, setShowRejectPanel] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getQaQueue()
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the queue.'))
  }, [])

  async function decide(decision: 'approved' | 'rejected') {
    const item = items?.[0]
    if (!item) return
    setSubmitting(true)
    setError(null)
    try {
      await submitQaDecision(item.id, { decision, defectTag: decision === 'rejected' ? defectTag : undefined })
      const nextApproved = approved + (decision === 'approved' ? 1 : 0)
      const nextRejected = rejected + (decision === 'rejected' ? 1 : 0)

      const refreshed = await getQaQueue()
      if (refreshed.items.length === 0) {
        router.push(`/qa/complete?approved=${nextApproved}&rejected=${nextRejected}`)
      } else {
        setItems(refreshed.items)
        setShowRejectPanel(false)
        router.replace(`/qa/item?approved=${nextApproved}&rejected=${nextRejected}`)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit that decision. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (error && !items) {
    return (
      <QueueShell badge="Origin QA" signOutHref="/qa" step={1}>
        <div className="card-surface-raised p-8 text-center sm:p-10">
          <p className="text-body text-destructive">{error}</p>
        </div>
      </QueueShell>
    )
  }

  if (!items) {
    return (
      <QueueShell badge="Origin QA" signOutHref="/qa" step={1}>
        <div className="flex justify-center p-16">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      </QueueShell>
    )
  }

  const item = items[0]
  if (!item) {
    router.push(`/qa/complete?approved=${approved}&rejected=${rejected}`)
    return null
  }

  const flagged = item.latestValidation?.outcome === 'fail'

  return (
    <QueueShell badge="Origin QA" signOutHref="/qa" step={1}>
      <div className="card-surface-raised p-8 sm:p-10">
        <div className="flex items-center justify-between">
          <p className="text-eyebrow text-accent">{items.length} remaining</p>
          <p className="font-mono text-caption text-muted-foreground">{item.id.slice(0, 8)}</p>
        </div>

        <h1 className="text-h2 mt-2 text-balance text-foreground">Manual review</h1>

        {flagged && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 p-4 text-body-sm text-warning">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <span>
              Automated Validation note:{' '}
              <strong className="font-semibold">{item.latestValidation?.reason}</strong> — listen
              closely before deciding.
            </span>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-border bg-paper-100 p-6 text-center">
          <p className="text-body-sm font-semibold text-foreground">{item.batch.title}</p>
          {item.batch.brief && <p className="text-body-sm mt-1 text-muted-foreground">{item.batch.brief}</p>}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-paper-100 p-5">
          {item.mediaType === 'audio' ? (
            <div className="flex items-center gap-4">
              <button
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-navy-800 text-white hover:bg-navy-700"
                aria-label="Play recording"
              >
                <Play className="size-5" />
              </button>
              <audio controls src={item.downloadUrl} className="w-full">
                Your browser does not support audio playback.
              </audio>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.downloadUrl}
              alt="Submission"
              className="mx-auto max-h-80 rounded-lg border border-border object-contain"
            />
          )}
        </div>

        {error && (
          <p className="mt-4 text-caption text-destructive" role="alert">
            {error}
          </p>
        )}

        {!showRejectPanel ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => decide('approved')}
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-md border border-success/30 bg-success/5 px-4 py-3 text-sm font-semibold text-success hover:bg-success/10 disabled:opacity-50"
            >
              <CheckCircle2 className="size-4" />
              Approve
            </button>
            <button
              onClick={() => setShowRejectPanel(true)}
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              <XCircle className="size-4" />
              Reject
            </button>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
            <p className="text-body-sm font-semibold text-foreground">Tag the defect</p>
            <div className="mt-3 space-y-2">
              {ERR_TAGS.map((tag) => (
                <label
                  key={tag}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-body-sm transition-colors',
                    defectTag === tag ? 'border-destructive/50 bg-destructive/10' : 'border-border bg-background',
                  )}
                >
                  <input
                    type="radio"
                    name="defect"
                    checked={defectTag === tag}
                    onChange={() => setDefectTag(tag)}
                    className="size-4 accent-destructive"
                  />
                  <span className="font-mono font-semibold text-foreground">{tag}</span>
                  <span className="text-muted-foreground">{ERR_TAG_LABELS[tag]}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowRejectPanel(false)}
                disabled={submitting}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => decide('rejected')}
                disabled={submitting}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-destructive/90 text-sm font-semibold text-destructive-foreground hover:bg-destructive disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : `Confirm reject · ${defectTag}`}
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
