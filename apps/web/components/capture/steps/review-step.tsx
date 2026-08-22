'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, RotateCcw } from 'lucide-react'
import { useCaptureSession } from '@/components/capture/capture-session-context'
import { presignUpload, uploadFile } from '@/lib/api/endpoints/uploads'
import { createSubmission } from '@/lib/api/endpoints/submissions'
import { ApiError } from '@/lib/api/client'

export function ReviewStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { session, update } = useCaptureSession()
  const isImage = session.mediaType === 'image'

  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session.capturedBlob) return
    const url = URL.createObjectURL(session.capturedBlob)
    setObjectUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [session.capturedBlob])

  async function onSubmit() {
    if (!session.capturedBlob || !session.batchId || !session.consentRecordId || !session.mediaType) return
    setError(null)
    setSubmitting(true)
    try {
      const mimeType = session.capturedBlob.type || (isImage ? 'image/jpeg' : 'audio/webm')
      const { uploadUrl, storageKey } = await presignUpload({
        batchId: session.batchId,
        mediaType: session.mediaType,
        mimeType,
      })
      await uploadFile(uploadUrl, session.capturedBlob)

      const { submission, validation } = await createSubmission({
        batchId: session.batchId,
        consentRecordId: session.consentRecordId,
        mediaType: session.mediaType,
        storageKey,
        fileSizeBytes: session.capturedBlob.size,
        mimeType,
        durationSeconds: session.durationSeconds ?? undefined,
        imageMetadata: session.imageMetadata ?? undefined,
        capturedAt: session.capturedAt ?? new Date().toISOString(),
        deviceInfo: session.deviceInfo ?? {},
        geoLocation: session.geoLocation ?? undefined,
      })

      update({
        lastValidationResult: validation,
        lastSubmissionId: submission.id,
        retake: validation.outcome === 'fail',
        submittedCount: session.submittedCount + (validation.outcome === 'pass' ? 1 : 0),
      })
      onNext()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed. Your recording is still here — try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!session.capturedBlob) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="cx-body text-navy-400">Nothing captured yet.</p>
        <button onClick={onBack} className="mt-3 cx-body font-semibold text-accent">
          Back to capture
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <p className="cx-label text-navy-400">
        Item {session.submittedCount + 1} of {session.batchItemCount ?? '?'}
      </p>
      <h1 className="cx-page-title mt-2 text-navy-900">
        {isImage ? 'Preview your photo' : 'Review your recording'}
      </h1>
      <p className="cx-body mt-2 text-navy-500">
        {isImage ? 'Check the framing and category tag before submitting.' : 'Listen back before submitting.'}{' '}
        You can retake as many times as you need.
      </p>

      {isImage ? (
        <div className="cx-card mt-6 flex flex-col items-center gap-4 p-5">
          {objectUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={objectUrl}
              alt="Captured submission"
              className="aspect-square w-full max-w-xs rounded-md border border-border object-cover"
            />
          )}
          <div className="w-full max-w-xs rounded-md border border-border bg-background p-3 cx-meta text-navy-400">
            <p>
              GPS:{' '}
              {session.geoLocation
                ? `${session.geoLocation.lat.toFixed(4)}°, ${session.geoLocation.lng.toFixed(4)}°`
                : 'Not available'}
            </p>
            <p>Category: {(session.imageMetadata?.category as string) ?? '—'}</p>
          </div>
        </div>
      ) : (
        <div className="cx-card mt-6 flex flex-col items-center gap-3 p-5">
          {objectUrl && (
            <audio controls src={objectUrl} className="w-full">
              Your browser does not support audio playback.
            </audio>
          )}
          <p className="cx-meta tabular text-navy-400">{session.durationSeconds ?? 0}s recorded</p>
        </div>
      )}

      {error && (
        <p className="mt-4 cx-meta text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          onClick={onBack}
          disabled={submitting}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border px-5 text-sm font-medium text-navy-800 hover:bg-navy-50 disabled:opacity-50"
        >
          <RotateCcw className="size-4" />
          Retake
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Uploading…' : isImage ? 'Submit photo' : 'Submit recording'}
          {!submitting && <ArrowRight className="size-4" />}
        </button>
      </div>
    </div>
  )
}
