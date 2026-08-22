'use client'

import { PartyPopper, ArrowRight } from 'lucide-react'
import { useCaptureSession } from '@/components/capture/capture-session-context'

export function CompleteStep({ onCaptureNext, onEnd }: { onCaptureNext: () => void; onEnd: () => void }) {
  const { session } = useCaptureSession()
  const isImage = session.mediaType === 'image'
  const done = session.batchItemCount !== null && session.submittedCount >= session.batchItemCount

  return (
    <div className="mx-auto max-w-lg" role="status">
      <span className="flex size-10 items-center justify-center rounded-md bg-success/10">
        <PartyPopper className="size-5 text-success" />
      </span>
      <h1 className="cx-page-title mt-4 text-navy-900">{isImage ? 'Photo' : 'Recording'} submitted.</h1>
      <p className="cx-body mt-2 text-navy-500">
        Take passed Automated Validation and has been queued for Review Bench. Your submission is
        now stored separately from your identity — only your consent hash links back to you. You
        can track its status from your batches home.
      </p>

      <div className="cx-card mt-5 flex items-baseline justify-between p-4">
        <span className="cx-meta text-navy-400">Batch progress</span>
        <span className="cx-stat text-navy-900">
          {session.submittedCount}
          <span className="cx-body font-normal text-navy-400"> / {session.batchItemCount ?? '?'}</span>
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {!done && (
          <button
            onClick={onCaptureNext}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600"
          >
            Capture next item
            <ArrowRight className="size-4" />
          </button>
        )}
        <button
          onClick={onEnd}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-border px-6 text-sm font-medium text-navy-800 hover:bg-navy-50"
        >
          End session
        </button>
      </div>
    </div>
  )
}
