'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Camera, Mic, Square, TriangleAlert } from 'lucide-react'
import { CaptureShell } from '@/components/capture/capture-shell'
import { cn } from '@/lib/utils'

const PROMPT = 'Ọmọ tí kò gbọ́n ni ń jẹ èpò lọ́wọ́ ìyá rẹ̀.'
const CATEGORY_TAGS = ['Pest damage', 'Disease spots', 'Nutrient deficiency', 'Healthy control']

type RecordState = 'idle' | 'recording' | 'recorded'

function TaskPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id') ?? ''
  const type = searchParams.get('type') ?? 'audio'
  const isRetake = searchParams.get('retake') === '1'
  const isImage = type === 'image'

  // Audio path state
  const [recordState, setRecordState] = useState<RecordState>('idle')
  const [seconds, setSeconds] = useState(0)
  const [noiseFloor, setNoiseFloor] = useState(-52)

  useEffect(() => {
    if (recordState !== 'recording') return
    const timerId = setInterval(() => {
      setSeconds((s) => s + 1)
      setNoiseFloor(-58 + Math.round(Math.random() * 14))
    }, 1000)
    return () => clearInterval(timerId)
  }, [recordState])

  function startRecording() {
    setSeconds(0)
    setRecordState('recording')
  }

  function stopRecording() {
    setRecordState('recorded')
  }

  // Image path state
  const [captured, setCaptured] = useState(false)
  const [category, setCategory] = useState('')
  const capturedAt = new Date().toLocaleString()

  const continueHref = `/capture/review?id=${id}&type=${type}`
  const canContinue = isImage ? captured && category : recordState === 'recorded'

  return (
    <CaptureShell step={1}>
      <div className="card-surface-raised p-8 sm:p-10">
        {isRetake && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 p-4 text-body-sm text-warning">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <span>
              <strong className="font-semibold">Automated Validation flagged your last take</strong> —{' '}
              {isImage ? 'ERR-04 metadata anomaly' : 'ERR-01 background noise'} detected. Please
              retry.
            </span>
          </div>
        )}

        <p className="text-eyebrow text-accent">Item 1 of 5</p>
        <h1 className="text-h2 mt-2 text-balance text-foreground">
          {isImage ? 'Photograph the item' : 'Read this sentence aloud'}
        </h1>

        {isImage ? (
          <>
            <div className="mt-6 rounded-xl border border-border bg-paper-100 p-6 text-center">
              <p className="text-body text-foreground">
                Target: <strong className="font-semibold">Tomato leaf, visible pest damage</strong>
              </p>
              <p className="text-body-sm mt-1 text-muted-foreground">
                Frame the full leaf in daylight, avoid shadows and blur.
              </p>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-10">
              {!captured ? (
                <>
                  <div className="flex size-40 items-center justify-center rounded-xl border border-border bg-navy-900/5 text-muted-foreground">
                    <Camera className="size-10" />
                  </div>
                  <button
                    onClick={() => setCaptured(true)}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600"
                  >
                    <Camera className="size-4" />
                    Capture photo
                  </button>
                </>
              ) : (
                <div className="w-full max-w-sm space-y-4 px-6">
                  <div className="flex aspect-square items-center justify-center rounded-xl border border-success/30 bg-success/5 text-success">
                    <Camera className="size-10" />
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3 text-caption text-muted-foreground">
                    <p>Timestamp: {capturedAt}</p>
                    <p>GPS: 10.5222° N, 7.4384° E</p>
                  </div>
                  <div>
                    <label className="text-body-sm font-medium text-foreground">Category tag</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-body outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20"
                    >
                      <option value="">Select a category</option>
                      {CATEGORY_TAGS.map((tag) => (
                        <option key={tag} value={tag}>
                          {tag}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => setCaptured(false)}
                    className="text-body-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Retake photo
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 rounded-xl border border-border bg-paper-100 p-6 text-center">
              <p className="font-display text-h3 text-foreground" lang="yo">
                {PROMPT}
              </p>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-10">
              <button
                onClick={recordState === 'recording' ? stopRecording : startRecording}
                className={cn(
                  'flex size-16 items-center justify-center rounded-full transition-colors',
                  recordState === 'recording'
                    ? 'bg-destructive text-destructive-foreground'
                    : 'bg-accent text-accent-foreground hover:bg-copper-600',
                )}
                aria-label={recordState === 'recording' ? 'Stop recording' : 'Start recording'}
              >
                {recordState === 'recording' ? <Square className="size-6" /> : <Mic className="size-7" />}
              </button>

              {recordState === 'idle' && <p className="text-body-sm text-muted-foreground">Tap to start recording</p>}
              {recordState === 'recording' && (
                <div className="flex flex-col items-center gap-1.5">
                  <p className="text-body-sm tabular text-foreground">
                    <span className="live-dot mr-1.5 inline-block size-2 rounded-full bg-destructive align-middle" />
                    Recording · 0:{String(seconds).padStart(2, '0')}
                  </p>
                  <p className="text-caption tabular text-muted-foreground">
                    Noise floor: {noiseFloor} dB · {noiseFloor > -45 ? 'Too loud, find a quieter space' : 'Clear'}
                  </p>
                </div>
              )}
              {recordState === 'recorded' && (
                <p className="text-body-sm font-medium text-success">Take captured · 0:{String(seconds).padStart(2, '0')}</p>
              )}
            </div>
          </>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            onClick={() => router.push(`/capture/consent?id=${id}&type=${type}`)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border px-6 text-sm font-semibold text-foreground hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <button
            disabled={!canContinue}
            onClick={() => router.push(continueHref)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </CaptureShell>
  )
}

export default function TaskPage() {
  return (
    <Suspense>
      <TaskPageContent />
    </Suspense>
  )
}
