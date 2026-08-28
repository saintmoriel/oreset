'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, TriangleAlert, XCircle } from 'lucide-react'
import { ERR_TAGS, ERR_TAG_LABELS, SEVERITY_LEVELS, SEVERITY_LABELS, type ErrTag, type Severity } from '@oreset/shared'
import { OperatorAppShell } from '@/components/operator/operator-app-shell'
import { getOperatorQueue, submitOperatorDecision, type OperatorQueueItem } from '@/lib/api/endpoints/operator'
import { ApiError } from '@/lib/api/client'
import { cn } from '@/lib/utils'

const INTERACTIVE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'])

export default function OperatorItemPage() {
  const router = useRouter()

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
    if (!item || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await submitOperatorDecision(item.id, {
        decision,
        errTag: decision === 'escalated' ? errTag : undefined,
        severity: decision === 'escalated' ? severity : undefined,
      })
      const refreshed = await getOperatorQueue()
      if (refreshed.items.length === 0) {
        // Real stats on Home already reflect everything just decided.
        router.push('/operator/home')
      } else {
        setItems(refreshed.items)
        setShowEscalatePanel(false)
        setErrTag(ERR_TAGS[0])
        setSeverity(SEVERITY_LEVELS[0])
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit that decision. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // A approve (direct, matches today's one-click behavior), R reject
  // (direct, no extra data needed), E opens the escalate panel (1-4 pick
  // the err tag, Enter confirms with whatever severity is selected, Esc
  // cancels — severity stays mouse-only, a real third axis isn't worth
  // cramming onto the keyboard).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const active = document.activeElement
      if (active && INTERACTIVE_TAGS.has(active.tagName)) return
      if (!items?.[0] || submitting) return

      if (!showEscalatePanel) {
        if (e.key === 'a' || e.key === 'A') decide('approved')
        else if (e.key === 'r' || e.key === 'R') decide('rejected')
        else if (e.key === 'e' || e.key === 'E') setShowEscalatePanel(true)
        return
      }

      if (e.key === 'Escape') setShowEscalatePanel(false)
      else if (e.key === 'Enter') decide('escalated')
      else if (['1', '2', '3', '4'].includes(e.key)) setErrTag(ERR_TAGS[Number(e.key) - 1])
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, showEscalatePanel, submitting, errTag, severity])

  if (error && !items) {
    return (
      <OperatorAppShell>
        <p className="cx-body text-destructive">{error}</p>
      </OperatorAppShell>
    )
  }

  if (!items) {
    return (
      <OperatorAppShell>
        <div className="flex justify-center p-16">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      </OperatorAppShell>
    )
  }

  const item = items[0]
  if (!item) {
    router.push('/operator/home')
    return null
  }

  return (
    <OperatorAppShell>
      <div className="flex items-center justify-between">
        <p className="cx-label text-navy-400">{items.length} remaining</p>
        <p className="cx-mono-meta text-navy-400">{item.externalRef}</p>
      </div>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Review against SOP brief</h1>

      <div className="cx-card mt-6 p-5">
        <p className="cx-body text-navy-800">{item.content}</p>
      </div>

      {error && (
        <p className="mt-4 cx-meta text-destructive" role="alert">
          {error}
        </p>
      )}

      {!showEscalatePanel ? (
        <>
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
          <p className="mt-3 cx-mono-meta text-navy-300">A approve · R reject · E escalate</p>
        </>
      ) : (
        <div className="cx-card mt-8 border-warning/30 bg-warning/5 p-5">
          <p className="cx-body font-semibold text-navy-900">Tag the issue</p>
          <div className="mt-3 space-y-2">
            {ERR_TAGS.map((tag, i) => (
              <label
                key={tag}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-md border p-3 cx-body cx-fade',
                  errTag === tag ? 'border-warning/50 bg-warning/10' : 'border-border bg-card',
                )}
              >
                <input
                  type="radio"
                  name="err"
                  checked={errTag === tag}
                  onChange={() => setErrTag(tag)}
                  className="size-4 accent-warning"
                />
                <span className="cx-mono-meta font-semibold text-navy-800">
                  {i + 1} · {tag}
                </span>
                <span className="text-navy-500">{ERR_TAG_LABELS[tag]}</span>
              </label>
            ))}
          </div>

          <p className="mt-4 cx-body font-semibold text-navy-900">Severity</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {SEVERITY_LEVELS.map((sev) => (
              <label
                key={sev}
                className={cn(
                  'flex cursor-pointer flex-col gap-1 rounded-md border p-3 cx-meta cx-fade',
                  severity === sev ? 'border-warning/50 bg-warning/10' : 'border-border bg-card',
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
                  <span className="cx-mono-meta font-semibold text-navy-800">{sev}</span>
                </span>
                <span className="text-navy-500">{SEVERITY_LABELS[sev]}</span>
              </label>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setShowEscalatePanel(false)}
              disabled={submitting}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border text-sm font-semibold text-navy-800 hover:bg-navy-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => decide('escalated')}
              disabled={submitting}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-warning px-4 text-sm font-semibold text-warning-foreground hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : `Route to client ticket queue · ${errTag} / ${severity}`}
            </button>
          </div>
          <p className="mt-3 cx-mono-meta text-navy-300">1–4 pick tag · Enter confirm · Esc cancel</p>
        </div>
      )}
    </OperatorAppShell>
  )
}
