'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, Pause, Play, TriangleAlert, XCircle } from 'lucide-react'
import { ERR_TAGS, ERR_TAG_LABELS, type ErrTag } from '@oreset/shared'
import { QaAppShell } from '@/components/qa/qa-app-shell'
import { getQaQueue, submitQaDecision, type QaQueueItem } from '@/lib/api/endpoints/qa'
import { ApiError } from '@/lib/api/client'
import { cn } from '@/lib/utils'

const INTERACTIVE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'])

export default function QaItemPage() {
  const router = useRouter()

  const [items, setItems] = useState<QaQueueItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [defectTag, setDefectTag] = useState<ErrTag>(ERR_TAGS[0])
  const [showRejectPanel, setShowRejectPanel] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    getQaQueue()
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the queue.'))
  }, [])

  async function decide(decision: 'approved' | 'rejected') {
    const item = items?.[0]
    if (!item || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await submitQaDecision(item.id, { decision, defectTag: decision === 'rejected' ? defectTag : undefined })
      const refreshed = await getQaQueue()
      if (refreshed.items.length === 0) {
        // Real stats on Home already reflect everything just decided — no
        // fragile session-only tally needed to hand off between pages.
        router.push('/qa/home')
      } else {
        setItems(refreshed.items)
        setShowRejectPanel(false)
        setDefectTag(ERR_TAGS[0])
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit that decision. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Real keyboard shortcuts for a high-volume review workflow — A to
  // approve, R to open the reject panel (1-4 to pick a defect tag, Enter to
  // confirm, Esc to cancel), Space to play/pause. Ignored while focus is in
  // an interactive element so normal typing/clicking still works.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const active = document.activeElement
      if (active && INTERACTIVE_TAGS.has(active.tagName)) return
      if (!items?.[0] || submitting) return

      if (e.key === ' ') {
        e.preventDefault()
        const audio = audioRef.current
        if (audio) {
          if (audio.paused) audio.play()
          else audio.pause()
        }
        return
      }

      if (!showRejectPanel) {
        if (e.key === 'a' || e.key === 'A') decide('approved')
        else if (e.key === 'r' || e.key === 'R') setShowRejectPanel(true)
        return
      }

      if (e.key === 'Escape') setShowRejectPanel(false)
      else if (e.key === 'Enter') decide('rejected')
      else if (['1', '2', '3', '4'].includes(e.key)) setDefectTag(ERR_TAGS[Number(e.key) - 1])
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, showRejectPanel, submitting, defectTag])

  if (error && !items) {
    return (
      <QaAppShell>
        <p className="cx-body text-destructive">{error}</p>
      </QaAppShell>
    )
  }

  if (!items) {
    return (
      <QaAppShell>
        <div className="flex justify-center p-16">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      </QaAppShell>
    )
  }

  const item = items[0]
  if (!item) {
    router.push('/qa/home')
    return null
  }

  const flagged = item.latestValidation?.outcome === 'fail'

  return (
    <QaAppShell>
      <div className="flex items-center justify-between">
        <p className="cx-label text-navy-400">{items.length} remaining</p>
        <p className="cx-mono-meta text-navy-400">{item.id.slice(0, 8)}</p>
      </div>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Manual review</h1>

      {flagged && (
        <div className="cx-card mt-4 flex items-start gap-2.5 border-warning/30 bg-warning/5 p-4">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
          <p className="cx-body text-navy-500">
            Automated Validation note: <strong className="font-semibold text-navy-800">{item.latestValidation?.reason}</strong> — listen closely before deciding.
          </p>
        </div>
      )}

      <div className="cx-card mt-6 p-6 text-center">
        <p className="cx-title text-navy-900">{item.batch.title}</p>
        {item.batch.brief && <p className="cx-body mt-1 text-navy-500">{item.batch.brief}</p>}
      </div>

      <div className="cx-card mt-4 p-5">
        {item.mediaType === 'audio' ? (
          <AudioPlayer ref={audioRef} src={item.downloadUrl} />
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
        <p className="mt-4 cx-meta text-destructive" role="alert">
          {error}
        </p>
      )}

      {!showRejectPanel ? (
        <>
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
          <p className="mt-3 cx-mono-meta text-navy-300">A approve · R reject · Space play/pause</p>
        </>
      ) : (
        <div className="cx-card mt-8 border-destructive/30 bg-destructive/5 p-5">
          <p className="cx-body font-semibold text-navy-900">Tag the defect</p>
          <div className="mt-3 space-y-2">
            {ERR_TAGS.map((tag, i) => (
              <label
                key={tag}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-md border p-3 cx-body cx-fade',
                  defectTag === tag ? 'border-destructive/50 bg-destructive/10' : 'border-border bg-card',
                )}
              >
                <input
                  type="radio"
                  name="defect"
                  checked={defectTag === tag}
                  onChange={() => setDefectTag(tag)}
                  className="size-4 accent-destructive"
                />
                <span className="cx-mono-meta font-semibold text-navy-800">
                  {i + 1} · {tag}
                </span>
                <span className="text-navy-500">{ERR_TAG_LABELS[tag]}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setShowRejectPanel(false)}
              disabled={submitting}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border text-sm font-semibold text-navy-800 hover:bg-navy-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => decide('rejected')}
              disabled={submitting}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-destructive px-4 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : `Confirm reject · ${defectTag}`}
            </button>
          </div>
          <p className="mt-3 cx-mono-meta text-navy-300">1–4 pick tag · Enter confirm · Esc cancel</p>
        </div>
      )}
    </QaAppShell>
  )
}

function AudioPlayer({ src, ref }: { src: string; ref: React.Ref<HTMLAudioElement> }) {
  const [playing, setPlaying] = useState(false)
  const innerRef = useRef<HTMLAudioElement | null>(null)

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => {
          const audio = innerRef.current
          if (!audio) return
          if (audio.paused) audio.play()
          else audio.pause()
        }}
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-navy-900 text-white hover:bg-navy-800"
        aria-label={playing ? 'Pause recording' : 'Play recording'}
      >
        {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
      </button>
      <audio
        ref={(el) => {
          innerRef.current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) (ref as React.RefObject<HTMLAudioElement | null>).current = el
        }}
        controls
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="w-full"
      >
        Your browser does not support audio playback.
      </audio>
    </div>
  )
}
