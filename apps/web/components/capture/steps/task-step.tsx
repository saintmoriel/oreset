'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Camera, Mic, Square, TriangleAlert } from 'lucide-react'
import { useCaptureSession } from '@/components/capture/capture-session-context'
import { listPrompts, type Prompt } from '@/lib/api/endpoints/prompts'
import { cn } from '@/lib/utils'

const FALLBACK_PROMPT = {
  audio: 'No specific prompt authored yet — read any short, clear sentence.',
  image: 'No specific prompt authored yet — photograph any relevant item for this batch.',
}

const CATEGORY_TAGS = ['Pest damage', 'Disease spots', 'Nutrient deficiency', 'Healthy control']

type RecordState = 'idle' | 'requesting' | 'recording' | 'recorded' | 'error'
type GeoState = 'idle' | 'requesting' | 'granted' | 'denied'

function deviceInfo(): Record<string, unknown> {
  return { userAgent: navigator.userAgent, platform: navigator.platform, language: navigator.language }
}

// Real mic-amplitude feedback while recording — not decorative animation.
// Reads the same MediaStream MediaRecorder is already capturing from, via a
// separate AnalyserNode tap, so it costs nothing extra to request.
function Waveform({ analyser, active }: { analyser: AnalyserNode | null; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active || !analyser) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const data = new Uint8Array(analyser.frequencyBinCount)
    const barCount = 32

    function draw() {
      analyser!.getByteTimeDomainData(data)
      const { width, height } = canvas!
      ctx!.clearRect(0, 0, width, height)
      ctx!.fillStyle = '#c56a32'
      const step = Math.floor(data.length / barCount)
      const barWidth = width / barCount
      for (let i = 0; i < barCount; i++) {
        const amplitude = Math.abs(data[i * step] - 128) / 128
        const barHeight = Math.max(3, amplitude * height)
        ctx!.fillRect(i * barWidth + 1, (height - barHeight) / 2, Math.max(1, barWidth - 2), barHeight)
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [analyser, active])

  return <canvas ref={canvasRef} width={240} height={56} aria-hidden="true" />
}

export function TaskStep({
  isRetake,
  onBack,
  onNext,
}: {
  isRetake: boolean
  onBack: () => void
  onNext: () => void
}) {
  const { session, update } = useCaptureSession()
  const isImage = session.mediaType === 'image'

  const [prompts, setPrompts] = useState<Prompt[] | null>(null)
  useEffect(() => {
    if (!session.batchId) return
    listPrompts(session.batchId)
      .then((res) => setPrompts(res.prompts))
      .catch(() => setPrompts([])) // fall back to generic prompt text rather than blocking capture
  }, [session.batchId])
  const currentPrompt = prompts?.[session.submittedCount]?.content ?? FALLBACK_PROMPT[isImage ? 'image' : 'audio']

  // Audio path state
  const [recordState, setRecordState] = useState<RecordState>('idle')
  const [seconds, setSeconds] = useState(0)
  const [recordError, setRecordError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)

  useEffect(() => {
    if (recordState !== 'recording') return
    const timerId = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(timerId)
  }, [recordState])

  function teardownAudioTap() {
    audioContextRef.current?.close().catch(() => {})
    audioContextRef.current = null
    setAnalyser(null)
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      teardownAudioTap()
    }
  }, [])

  async function startRecording() {
    setRecordError(null)
    setRecordState('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        stream.getTracks().forEach((t) => t.stop())
        teardownAudioTap()
        update({
          capturedBlob: blob,
          capturedAt: new Date().toISOString(),
          durationSeconds: seconds,
          deviceInfo: deviceInfo(),
        })
        setRecordState('recorded')
      }
      mediaRecorderRef.current = recorder

      // Real amplitude tap for the live waveform — a separate read-only
      // consumer of the same stream, doesn't affect what MediaRecorder
      // captures.
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyserNode = audioContext.createAnalyser()
      analyserNode.fftSize = 256
      source.connect(analyserNode)
      audioContextRef.current = audioContext
      setAnalyser(analyserNode)

      setSeconds(0)
      recorder.start()
      setRecordState('recording')
    } catch {
      setRecordError('Microphone access was denied. Enable it in your browser settings to continue.')
      setRecordState('error')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
  }

  // Image path state
  const [category, setCategory] = useState('')
  const [geoState, setGeoState] = useState<GeoState>('idle')
  const [geoError, setGeoError] = useState<string | null>(null)
  const captured = Boolean(session.capturedBlob) && isImage

  function onFileSelected(file: File | null) {
    if (!file) return
    setGeoState('requesting')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoState('granted')
        update({
          capturedBlob: file,
          capturedAt: new Date().toISOString(),
          deviceInfo: deviceInfo(),
          geoLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy },
        })
      },
      () => {
        setGeoState('denied')
        setGeoError('Location access was denied — required for this batch. Enable it to continue.')
        // Still capture the photo; geoLocation stays unset rather than
        // silently submitting a fabricated location.
        update({ capturedBlob: file, capturedAt: new Date().toISOString(), deviceInfo: deviceInfo() })
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  function retakePhoto() {
    setGeoState('idle')
    setGeoError(null)
    update({ capturedBlob: null, geoLocation: null })
  }

  const canContinue = isImage
    ? captured && Boolean(category) && geoState !== 'requesting'
    : recordState === 'recorded'

  const retakeReason = session.lastValidationResult?.reason

  return (
    <div className="mx-auto max-w-lg">
      {isRetake && (
        <div className="mb-5 flex items-start gap-2.5 rounded-md border border-warning/30 bg-warning/5 p-3.5">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
          <p className="cx-body text-navy-500">
            <strong className="font-semibold text-navy-800">Automated Validation flagged your last take</strong>
            {retakeReason ? ` — ${retakeReason}` : ''}. Please retry.
          </p>
        </div>
      )}

      <p className="cx-label text-navy-400">
        Item {session.submittedCount + 1} of {session.batchItemCount ?? '?'}
      </p>
      <h1 className="cx-page-title mt-2 text-navy-900">
        {isImage ? 'Photograph the item' : 'Read this sentence aloud'}
      </h1>

      {isImage ? (
        <>
          <div className="cx-card mt-5 p-5 text-center">
            <p className="cx-body text-navy-800">
              Target: <strong className="font-semibold">{currentPrompt}</strong>
            </p>
            <p className="cx-meta mt-1 text-navy-400">
              Frame the full subject in daylight, avoid shadows and blur.
            </p>
          </div>

          <div className="mt-6 flex min-h-88 flex-col items-center justify-center gap-5 rounded-lg border border-dashed border-border py-10">
            {!captured ? (
              <>
                <div className="flex size-56 items-center justify-center rounded-lg border border-border bg-navy-50 text-navy-300">
                  <Camera className="size-14" />
                </div>
                <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600">
                  <Camera className="size-4" />
                  Capture photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
                  />
                </label>
                {geoError && <p className="max-w-xs cx-meta text-warning">{geoError}</p>}
              </>
            ) : (
              <div className="w-full max-w-sm space-y-4 px-6">
                <div className="flex aspect-square items-center justify-center rounded-lg border border-success/30 bg-success/5 text-success">
                  <Camera className="size-10" />
                </div>
                <div className="cx-card cx-mono-meta p-3 text-navy-400">
                  <p>Timestamp: {session.capturedAt && new Date(session.capturedAt).toLocaleString()}</p>
                  <p>
                    GPS:{' '}
                    {session.geoLocation
                      ? `${session.geoLocation.lat.toFixed(4)}°, ${session.geoLocation.lng.toFixed(4)}°`
                      : 'Not available'}
                  </p>
                </div>
                <div>
                  <label className="cx-meta font-medium text-navy-800">Category tag</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value)
                      update({ imageMetadata: { category: e.target.value } })
                    }}
                    className="mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 cx-body text-navy-800 outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
                  >
                    <option value="">Select a category</option>
                    {CATEGORY_TAGS.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
                <button onClick={retakePhoto} className="cx-meta font-medium text-navy-400 hover:text-navy-800">
                  Retake photo
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="cx-card mt-5 p-5 text-center">
            <p className="cx-title text-navy-900">{currentPrompt}</p>
          </div>

          <div className="mt-6 flex min-h-88 flex-col items-center justify-center gap-5 rounded-lg border border-dashed border-border py-10">
            <button
              onClick={recordState === 'recording' ? stopRecording : startRecording}
              disabled={recordState === 'requesting'}
              className={cn(
                'flex size-24 items-center justify-center rounded-full transition-colors disabled:opacity-60',
                recordState === 'recording'
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-accent text-accent-foreground hover:bg-copper-600',
              )}
              aria-label={recordState === 'recording' ? 'Stop recording' : 'Start recording'}
            >
              {recordState === 'recording' ? <Square className="size-9" /> : <Mic className="size-10" />}
            </button>

            {recordState === 'idle' && <p className="cx-body text-navy-400">Tap to start recording</p>}
            {recordState === 'requesting' && <p className="cx-body text-navy-400">Requesting microphone access…</p>}
            {recordState === 'recording' && (
              <>
                <Waveform analyser={analyser} active={recordState === 'recording'} />
                <p className="cx-body font-mono tabular-nums text-navy-800">
                  <span className="live-dot mr-1.5 inline-block size-2 rounded-full bg-destructive align-middle" />
                  Recording · 0:{String(seconds).padStart(2, '0')}
                </p>
              </>
            )}
            {recordState === 'recorded' && (
              <p className="cx-body font-mono font-medium tabular-nums text-success">
                Take captured · 0:{String(seconds).padStart(2, '0')}
              </p>
            )}
            {recordState === 'error' && recordError && (
              <p className="max-w-xs text-center cx-body text-destructive">{recordError}</p>
            )}
          </div>
        </>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          onClick={onBack}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border px-5 text-sm font-medium text-navy-800 hover:bg-navy-50"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <button
          disabled={!canContinue}
          onClick={onNext}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
