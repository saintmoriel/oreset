'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, TriangleAlert, XCircle } from 'lucide-react'
import { QueueShell } from '@/components/shared/queue-shell'
import { CLIENT_QUEUE_ITEMS, ERR_TAGS, SEVERITY_LEVELS } from '@/lib/operator-mock-data'
import { cn } from '@/lib/utils'

function OperatorItemContent() {
  const router = useRouter()
  const params = useSearchParams()

  const remaining = Number(params.get('remaining') ?? CLIENT_QUEUE_ITEMS.length)
  const approved = Number(params.get('approved') ?? 0)
  const escalated = Number(params.get('escalated') ?? 0)
  const rejected = Number(params.get('rejected') ?? 0)

  const [errTag, setErrTag] = useState<string>(ERR_TAGS[0].code)
  const [severity, setSeverity] = useState<string>(SEVERITY_LEVELS[0].code)
  const [showEscalatePanel, setShowEscalatePanel] = useState(false)

  const item = CLIENT_QUEUE_ITEMS[CLIENT_QUEUE_ITEMS.length - remaining] ?? CLIENT_QUEUE_ITEMS[0]

  function advance(next: { approved: number; escalated: number; rejected: number }) {
    const nextRemaining = remaining - 1
    const query = `approved=${next.approved}&escalated=${next.escalated}&rejected=${next.rejected}`
    if (nextRemaining <= 0) {
      router.push(`/operator/complete?${query}`)
    } else {
      router.push(`/operator/item?remaining=${nextRemaining}&${query}`)
    }
  }

  return (
    <QueueShell badge="Client Queue" signOutHref="/operator" step={1}>
      <div className="card-surface-raised p-8 sm:p-10">
        <div className="flex items-center justify-between">
          <p className="text-eyebrow text-accent">
            Item {CLIENT_QUEUE_ITEMS.length - remaining + 1} of {CLIENT_QUEUE_ITEMS.length}
          </p>
          <p className="font-mono text-caption text-muted-foreground">{item.id}</p>
        </div>

        <h1 className="text-h2 mt-2 text-balance text-foreground">Review against SOP brief</h1>

        <div className="mt-6 rounded-xl border border-border bg-paper-100 p-5 text-body-sm text-foreground">
          {item.transcript}
        </div>

        {!showEscalatePanel ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <button
              onClick={() => advance({ approved: approved + 1, escalated, rejected })}
              className="flex items-center justify-center gap-2 rounded-md border border-success/30 bg-success/5 px-4 py-3 text-sm font-semibold text-success hover:bg-success/10"
            >
              <CheckCircle2 className="size-4" />
              Approve
            </button>
            <button
              onClick={() => setShowEscalatePanel(true)}
              className="flex items-center justify-center gap-2 rounded-md border border-warning/30 bg-warning/5 px-4 py-3 text-sm font-semibold text-warning hover:bg-warning/10"
            >
              <TriangleAlert className="size-4" />
              Escalate
            </button>
            <button
              onClick={() => advance({ approved, escalated, rejected: rejected + 1 })}
              className="flex items-center justify-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10"
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
                  key={tag.code}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-body-sm transition-colors',
                    errTag === tag.code ? 'border-warning/50 bg-warning/10' : 'border-border bg-background',
                  )}
                >
                  <input
                    type="radio"
                    name="err"
                    checked={errTag === tag.code}
                    onChange={() => setErrTag(tag.code)}
                    className="size-4 accent-warning"
                  />
                  <span className="font-mono font-semibold text-foreground">{tag.code}</span>
                  <span className="text-muted-foreground">{tag.label}</span>
                </label>
              ))}
            </div>

            <p className="mt-4 text-body-sm font-semibold text-foreground">Severity</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {SEVERITY_LEVELS.map((sev) => (
                <label
                  key={sev.code}
                  className={cn(
                    'flex cursor-pointer flex-col gap-1 rounded-lg border p-3 text-caption transition-colors',
                    severity === sev.code ? 'border-warning/50 bg-warning/10' : 'border-border bg-background',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="severity"
                      checked={severity === sev.code}
                      onChange={() => setSeverity(sev.code)}
                      className="size-3.5 accent-warning"
                    />
                    <span className="font-mono font-semibold text-foreground">{sev.code}</span>
                  </span>
                  <span className="text-muted-foreground">{sev.label}</span>
                </label>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowEscalatePanel(false)}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border text-sm font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => advance({ approved, escalated: escalated + 1, rejected })}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-warning/90 text-sm font-semibold text-warning-foreground hover:bg-warning"
              >
                Route to client ticket queue · {errTag} / {severity}
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
