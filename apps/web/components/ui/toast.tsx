'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Feedback for actions that succeed silently otherwise: sign-in, submissions,
// verdicts, account changes. Dispatch from anywhere with toast.success(...),
// render once with <Toaster /> in the root layout. Uses a DOM event so it
// works from any component without a provider, matching the codebase's
// existing oreset:* event pattern.

type Tone = 'success' | 'error' | 'info'
type ToastItem = { id: number; tone: Tone; title: string; detail?: string }

const EVENT = 'oreset:toast'
let seq = 0

function dispatch(tone: Tone, title: string, detail?: string) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<ToastItem>(EVENT, { detail: { id: ++seq, tone, title, detail } }))
}

export const toast = {
  success: (title: string, detail?: string) => dispatch('success', title, detail),
  error: (title: string, detail?: string) => dispatch('error', title, detail),
  info: (title: string, detail?: string) => dispatch('info', title, detail),
}

const ICON = { success: CheckCircle2, error: AlertCircle, info: Info }
const TONE = {
  success: 'border-success/40 text-success',
  error: 'border-destructive/40 text-destructive',
  info: 'border-accent/40 text-accent',
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    const onToast = (e: Event) => {
      const item = (e as CustomEvent<ToastItem>).detail
      setItems((prev) => [...prev, item])
      const ttl = item.tone === 'error' ? 8000 : 4500
      window.setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== item.id)), ttl)
    }
    window.addEventListener(EVENT, onToast)
    return () => window.removeEventListener(EVENT, onToast)
  }, [])

  if (items.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[200] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6" aria-live="polite" role="status">
      {items.map((t) => {
        const Icon = ICON[t.tone]
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-card p-3.5 shadow-[0_12px_40px_-12px_rgba(22,33,58,0.35)]',
              TONE[t.tone],
            )}
          >
            <Icon className="mt-0.5 size-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{t.title}</p>
              {t.detail && <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{t.detail}</p>}
            </div>
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
