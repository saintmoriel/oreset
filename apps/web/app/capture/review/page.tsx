'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Camera, Play, RotateCcw } from 'lucide-react'
import { CaptureShell } from '@/components/capture/capture-shell'

const BARS = [6, 14, 22, 12, 28, 18, 9, 24, 16, 30, 14, 8, 20, 26, 11, 17, 22, 7, 15, 13]

function ReviewContent() {
  const router = useRouter()
  const params = useSearchParams()
  const id = params.get('id') ?? ''
  const type = params.get('type') ?? 'audio'
  const isImage = type === 'image'

  return (
    <CaptureShell step={2}>
      <div className="card-surface-raised p-8 sm:p-10">
        <p className="text-eyebrow text-accent">Item 1 of 5</p>
        <h1 className="text-h2 mt-2 text-balance text-foreground">
          {isImage ? 'Preview your photo' : 'Review your recording'}
        </h1>
        <p className="text-body mt-3 text-pretty text-muted-foreground">
          {isImage
            ? 'Check the framing and category tag before submitting.'
            : 'Listen back before submitting.'}{' '}
          You can retake as many times as you need.
        </p>

        {isImage ? (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-border bg-paper-100 p-6">
            <div className="flex aspect-square w-full max-w-xs items-center justify-center rounded-xl border border-success/30 bg-success/5 text-success">
              <Camera className="size-10" />
            </div>
            <div className="w-full max-w-xs rounded-lg border border-border bg-background p-3 text-caption text-muted-foreground">
              <p>GPS: 10.5222° N, 7.4384° E</p>
              <p>Category: Pest damage</p>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex items-center gap-4 rounded-xl border border-border bg-paper-100 p-6">
            <button
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-navy-800 text-white hover:bg-navy-700"
              aria-label="Play recording"
            >
              <Play className="size-5" />
            </button>
            <div className="flex h-10 flex-1 items-end gap-0.5" aria-hidden="true">
              {BARS.map((h, i) => (
                <span key={i} className="flex-1 rounded-full bg-accent/50" style={{ height: `${h}px` }} />
              ))}
            </div>
            <span className="text-body-sm tabular text-muted-foreground">0:04</span>
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            onClick={() => router.push(`/capture/task?id=${id}&type=${type}`)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border px-6 text-sm font-semibold text-foreground hover:bg-muted"
          >
            <RotateCcw className="size-4" />
            Retake
          </button>
          <button
            onClick={() => router.push(`/capture/validation?id=${id}&type=${type}`)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600"
          >
            {isImage ? 'Submit photo' : 'Submit recording'}
            <ArrowRight className="size-4" />
          </button>
        </div>

        <button
          onClick={() => router.push(`/capture/task?id=${id}&type=${type}`)}
          className="mt-4 inline-flex items-center gap-1.5 text-body-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to item
        </button>
      </div>
    </CaptureShell>
  )
}

export default function ReviewPage() {
  return (
    <Suspense>
      <ReviewContent />
    </Suspense>
  )
}
