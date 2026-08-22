'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { resolveTicket } from '@/lib/api/endpoints/tickets'
import { ApiError } from '@/lib/api/client'

export function TicketResolveClient({ ticketId }: { ticketId: string }) {
  const router = useRouter()
  const [notes, setNotes] = useState('')
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onResolve() {
    setSubmitting(true)
    setError(null)
    try {
      await resolveTicket(ticketId, notes.trim() || undefined)
      router.refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not resolve this ticket.')
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-9 shrink-0 items-center rounded-md border border-border px-3 text-caption font-semibold text-foreground hover:bg-muted"
      >
        Resolve
      </button>
    )
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Resolution notes (optional)"
        rows={2}
        className="w-56 rounded-md border border-border bg-background px-2.5 py-1.5 text-caption outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20"
      />
      <div className="flex gap-2">
        <button
          onClick={() => setOpen(false)}
          disabled={submitting}
          className="h-8 rounded-md border border-border px-3 text-caption font-medium text-foreground hover:bg-muted"
        >
          Cancel
        </button>
        <button
          onClick={onResolve}
          disabled={submitting}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-accent px-3 text-caption font-semibold text-accent-foreground hover:bg-copper-600 disabled:opacity-60"
        >
          {submitting && <Loader2 className="size-3.5 animate-spin" />}
          Confirm
        </button>
      </div>
      {error && <p className="text-caption text-destructive">{error}</p>}
    </div>
  )
}
