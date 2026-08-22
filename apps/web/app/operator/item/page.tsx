'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Loader2, TriangleAlert, XCircle } from 'lucide-react'
import { ERR_TAGS, ERR_TAG_LABELS, SEVERITY_LEVELS, SEVERITY_LABELS, type ErrTag, type Severity } from '@oreset/shared'
import { QueueShell } from '@/components/shared/queue-shell'
import { getOperatorQueue, submitOperatorDecision, type OperatorQueueItem } from '@/lib/api/endpoints/operator'
import { ApiError } from '@/lib/api/client'
import { cn } from '@/lib/utils'

function OperatorItemContent() {
  const router = useRouter()
  const params = useSearchParams()
  const approved = Number(params.get('approved') ?? 0)
  const escalated = Number(params.get('escalated') ?? 0)
  const rejected = Number(params.get('rejected') ?? 0)

  const [items, setItems] = useState<OperatorQueueItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [errTag, setErrTag] = useState<ErrTag>(ERR_TAGS[0])
  const [severity, setSeverity] = useState<Severity>(SEVERITY_LEVELS[0])
  const [showEscalatePanel, setShowEscalatePanel] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getOperatorQueue()
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the queue.'))
  }, [])

  async function decide(decision: 'approved' | 'escalated' | 'rejected') {
    const item = items?.[0]
    if (!item) return
    setSubmitting(true)
    setError(null)
    try {
      await submitOperatorDecision(item.id, {
        decision,
        errTag: decision === 'escalated' ? errTag : undefined,
        severity: decision === 'escalated' ? severity : undefined,
      })
      const next = {
        approved: approved + (decision === 'approved' ? 1 : 0),
        escalated: escalated + (decision === 'escalated' ? 1 : 0),
        rejected: rejected + (decision === 'rejected' ? 1 : 0),
      }

      const refreshed = await getOperatorQueue()
      if (refreshed.items.length === 0) {
        router.push(`/operator/complete?approved=${next.approved}&escalated=${next.escalated}&rejected=${next.rejected}`)
      } else {
        setItems(refreshed.items)
        setShowEscalatePanel(false)
        router.replace(`/operator/item?approved=${next.approved}&escalated=${next.escalated}&rejected=${next.rejected}`)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit that decision. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (error && !items) {
    return (
      <QueueShell badge="Client Queue" signOutHref="/operator" step={1}>
        <div className="card-surface-raised p-8 text-center sm:p-10">
          <p className="text-body text-destructive">{error}</p>
        </div>
      </QueueShell>
    )
  }

  if (!items) {
    return (
      <QueueShell badge="Client Queue" signOutHref="/operator" step={1}>
        <div className="flex justify-center p-16">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      </QueueShell>
    )
  }

  const item = items[0]
  if (!item) {
    router.push(`/operator/complete?approved=${approved}&escalated=${escalated}&rejected=${rejected}`)
    return null
  }

  return (
    <QueueShell badge="Client Queue" signOutHref="/operator" step={1}>
      <div className="card-surface-raised p-8 sm:p-10">
        <div className="flex items-center justify-between">
          <p className="text-eyebrow text-accent">{items.length} remaining</p>
          <p className="font-mono text-caption text-muted-foreground">{item.externalRef}</p>
        </div>

        <h1 className="text-h2 mt-2 text-balance text-foreground">Review against SOP brief</h1>

        <div className="mt-6 rounded-xl border border-border bg-paper-100 p-5 text-body-sm text-foreground">
          {item.content}
        </div>

        {error && (
          <p className="mt-4 text-caption text-destructive" role="alert">
            {error}
          </p>
        )}

        {!showEscalatePanel ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <button
              onClick={() => decide('approved')}
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-md border border-success/30 bg-success/5 px-4 py-3 text-sm font-semibold text-success hover:bg-success/10 disabled:opacity-50"
            >
              <CheckCircle2 className="size-4" />
              Approve
            </button>
            <button
              onClick={() => setShowEscalatePanel(true)}
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-md border border-warning/30 bg-warning/5 px-4 py-3 text-sm font-semibold text-warning hover:bg-warning/10 disabled:opacity-50"
            >
              <TriangleAlert className="size-4" />
              Escalate
            </button>
            <button
              onClick={() => decide('rejected')}
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              <XCircle className="size-4" />
              Reject
            </button>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-warning/30 bg-warning/5 p-5">
            <p className="text-body-sm font-semibold text-foreground">Tag the issue</p>
            <div className="mt-3 space-y-2">
              {ERR_TAGS.map((tag) => (
                <label
                  key={tag}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-body-sm transition-colors',
                    errTag === tag ? 'border-warning/50 bg-warning/10' : 'border-border bg-background',
                  )}
                >
                  <input
                    type="radio"
                    name="err"
                    checked={errTag === tag}
                    onChange={() => setErrTag(tag)}
                    className="size-4 accent-warning"
                  />
                  <span className="font-mono font-semibold text-foreground">{tag}</span>
                  <span className="text-muted-foreground">{ERR_TAG_LABELS[tag]}</span>
                </label>
              ))}
            </div>

            <p className="mt-4 text-body-sm font-semibold text-foreground">Severity</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {SEVERITY_LEVELS.map((sev) => (
                <label
                  key={sev}
                  className={cn(
                    'flex cursor-pointer flex-col gap-1 rounded-lg border p-3 text-caption transition-colors',
                    severity === sev ? 'border-warning/50 bg-warning/10' : 'border-border bg-background',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="severity"
                      checked={severity === sev}
                      onChange={() => setSeverity(sev)}
                      className="size-3.5 accent-warning"
                    />
                    <span className="font-mono font-semibold text-foreground">{sev}</span>
                  </span>
                  <span className="text-muted-foreground">{SEVERITY_LABELS[sev]}</span>
                </label>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowEscalatePanel(false)}
                disabled={submitting}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => decide('escalated')}
                disabled={submitting}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-warning/90 text-sm font-semibold text-warning-foreground hover:bg-warning disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : `Route to client ticket queue · ${errTag} / ${severity}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </QueueShell>
  )
}

export default function OperatorItemPage() {
  return (
    <Suspense>
      <OperatorItemContent />
    </Suspense>
  )
}
