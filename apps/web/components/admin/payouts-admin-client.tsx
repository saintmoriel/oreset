'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, PlayCircle, Trash2 } from 'lucide-react'
import { runPayoutBatch, runRetentionSweep } from '@/lib/api/endpoints/payouts'
import { ApiError } from '@/lib/api/client'

export function PayoutsAdminClient() {
  const router = useRouter()
  const [runningPayouts, setRunningPayouts] = useState(false)
  const [runningRetention, setRunningRetention] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onRunPayouts() {
    setRunningPayouts(true)
    setError(null)
    setMessage(null)
    try {
      const { payoutsCreated } = await runPayoutBatch()
      setMessage(`Payout batch complete — ${payoutsCreated} payout${payoutsCreated === 1 ? '' : 's'} created.`)
      router.refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not run the payout batch.')
    } finally {
      setRunningPayouts(false)
    }
  }

  async function onRunRetention() {
    setRunningRetention(true)
    setError(null)
    setMessage(null)
    try {
      const { deletedCount } = await runRetentionSweep()
      setMessage(`Retention sweep complete — ${deletedCount} file${deletedCount === 1 ? '' : 's'} purged.`)
      router.refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not run the retention sweep.')
    } finally {
      setRunningRetention(false)
    }
  }

  return (
    <div className="cx-card p-6">
      <p className="cx-body font-semibold text-navy-900">Batch operations</p>
      <p className="cx-meta mt-1 text-navy-400">
        Both are admin-triggered manually here — in production these are wired to an external cron.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={onRunPayouts}
          disabled={runningPayouts}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:opacity-60"
        >
          {runningPayouts ? <Loader2 className="size-4 animate-spin" /> : <PlayCircle className="size-4" />}
          Run Payout Batch
        </button>
        <button
          onClick={onRunRetention}
          disabled={runningRetention}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-semibold text-navy-800 hover:bg-navy-50 disabled:opacity-60"
        >
          {runningRetention ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          Run Retention Sweep
        </button>
      </div>
      {message && <p className="mt-4 cx-meta text-success">{message}</p>}
      {error && <p className="mt-4 cx-meta text-destructive">{error}</p>}
    </div>
  )
}
