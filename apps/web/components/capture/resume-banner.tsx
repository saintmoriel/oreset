'use client'

import Link from 'next/link'
import { ArrowRight, Mic } from 'lucide-react'
import { useCaptureSession } from '@/components/capture/capture-session-context'
import type { Batch } from '@/lib/api/endpoints/batches'

// Shared between Home (a quick nudge) and Batches (the fuller list) — both
// already fetch the available-batches list, so this just looks up whether
// the in-progress session (if any) matches one of them.
export function ResumeBanner({ batches }: { batches: Batch[] }) {
  const { session } = useCaptureSession()
  if (!session.batchId) return null
  const batch = batches.find((b) => b.id === session.batchId)
  if (!batch) return null

  return (
    <Link
      href={`/capture/batches/${batch.id}`}
      className="cx-card mb-4 flex w-full items-center justify-between gap-3 border-accent/30 bg-accent/5 p-5 hover:bg-accent/10"
    >
      <span className="flex items-center gap-2.5">
        <Mic className="size-4 shrink-0 text-accent" />
        <span>
          <span className="cx-body block font-medium text-navy-900">Continue your batch</span>
          <span className="cx-meta block text-navy-400">{batch.title} — pick up where you left off</span>
        </span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-accent" />
    </Link>
  )
}
