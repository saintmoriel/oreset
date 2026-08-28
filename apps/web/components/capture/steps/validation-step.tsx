'use client'

import { ArrowRight, CheckCircle2, TriangleAlert } from 'lucide-react'
import { useCaptureSession } from '@/components/capture/capture-session-context'

export function ValidationStep({ onNext, onRetake }: { onNext: () => void; onRetake: () => void }) {
  const { session } = useCaptureSession()
  const result = session.lastValidationResult

  // No hard-refresh recovery needed here — this step only ever renders
  // while embedded in CapturePanel, which BatchDetailClient only mounts
  // once a session is already in progress.
  if (!result) return null

  const passed = result.outcome === 'pass'
  const isImage = session.mediaType === 'image'

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-6 text-center">
      <span
        className={`flex size-16 items-center justify-center rounded-full ${passed ? 'bg-success/10' : 'bg-warning/10'}`}
      >
        {passed ? (
          <CheckCircle2 className="size-8 text-success" />
        ) : (
          <TriangleAlert className="size-8 text-warning" />
        )}
      </span>

      <p className="cx-label text-navy-400">Automated Validation result</p>
      <h1 className="cx-page-title text-navy-900">{passed ? 'Passed — no errors detected' : 'Flagged for retake'}</h1>
      {!passed && (
        <div className="mx-auto max-w-sm">
          <p className="cx-body text-navy-500">
            We couldn&apos;t verify this {isImage ? 'photo' : 'recording'} — try again.
          </p>
          {result.reason && <p className="cx-mono-meta mt-2 text-navy-400">{result.reason}</p>}
        </div>
      )}

      {passed ? (
        <button
          onClick={onNext}
          className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600"
        >
          Continue
          <ArrowRight className="size-4" />
        </button>
      ) : (
        <button
          onClick={onRetake}
          className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-warning px-6 text-sm font-semibold text-warning-foreground hover:opacity-90"
        >
          Retake
          <ArrowRight className="size-4" />
        </button>
      )}
    </div>
  )
}
