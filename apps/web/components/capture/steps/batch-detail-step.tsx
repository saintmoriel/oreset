'use client'

import { ArrowRight, Camera, CheckCircle2, Mic, ShieldQuestion } from 'lucide-react'
import { useCaptureSession } from '@/components/capture/capture-session-context'
import { formatRate } from '@/lib/capture-format'
import type { Batch } from '@/lib/api/endpoints/batches'

const CHECKLIST = ['Find a quiet space with minimal background noise', 'Hold the phone steady throughout', 'Speak or frame clearly, at a natural pace']

export function BatchDetailStep({
  batch,
  onBegin,
  buttonLabel = 'Begin session',
  completed = false,
}: {
  batch: Batch
  onBegin: () => void
  buttonLabel?: string
  completed?: boolean
}) {
  const { update } = useCaptureSession()
  const TypeIcon = batch.type === 'audio' ? Mic : Camera
  const earnAmount = formatRate(batch.rateMinorUnits * batch.itemCount, batch.currency)
  const tags = [batch.campaign?.language, batch.campaign?.domain].filter(Boolean) as string[]

  const facts = [
    { label: 'Items', value: String(batch.itemCount) },
    { label: 'Rate', value: `${formatRate(batch.rateMinorUnits, batch.currency)} on approval` },
    { label: "You'd earn", value: `${earnAmount} for this batch` },
    { label: 'Paid', value: 'After Review Bench sign-off' },
    { label: 'Consent', value: 'Required before capture starts' },
    { label: 'Quality check', value: 'Automated, after every take' },
  ]

  function onBeginClick() {
    update({ batchId: batch.id, mediaType: batch.type, batchItemCount: batch.itemCount })
    onBegin()
  }

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-md bg-accent/10">
          <TypeIcon className="size-4 text-accent" />
        </span>
        <p className="cx-label text-navy-400">Origin · Capture</p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h1 className="cx-page-title text-navy-900">{batch.title}</h1>
        {tags.map((tag) => (
          <span key={tag} className="cx-meta rounded-full border border-border px-2 py-0.5 font-medium text-navy-500">
            {tag}
          </span>
        ))}
      </div>
      {batch.brief && <p className="cx-body mt-2 text-navy-500">{batch.brief}</p>}

      <div className="cx-card mt-6 grid grid-cols-2 gap-x-6 gap-y-4 p-5">
        {facts.map((fact) => (
          <div key={fact.label}>
            <p className="cx-meta text-navy-400">{fact.label}</p>
            <p className="cx-body mt-0.5 font-medium text-navy-800">{fact.value}</p>
          </div>
        ))}
      </div>

      {batch.guidelines && (
        <div className="mt-6">
          <p className="cx-title text-navy-800">Submission guidelines</p>
          <ul className="mt-2.5 space-y-2">
            {batch.guidelines.map((item) => (
              <li key={item} className="cx-body flex items-start gap-2 text-navy-500">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-navy-300" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {batch.requiredPermissions && (
        <div className="cx-card mt-6 flex items-start gap-2.5 p-4">
          <ShieldQuestion className="mt-0.5 size-4 shrink-0 text-accent" />
          <p className="cx-body text-navy-500">
            <strong className="font-semibold text-navy-800">Required permissions:</strong>{' '}
            {batch.requiredPermissions.join(', ')}. You&apos;ll be asked to grant these before capture.
          </p>
        </div>
      )}

      <div className="mt-6">
        <p className="cx-title text-navy-800">Before you start</p>
        <ul className="mt-2.5 space-y-2">
          {CHECKLIST.map((item) => (
            <li key={item} className="cx-body flex items-start gap-2 text-navy-500">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-navy-300" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {completed ? (
        <div className="mt-8 flex items-center gap-2.5 rounded-md border border-success/30 bg-success/5 p-4">
          <CheckCircle2 className="size-4 shrink-0 text-success" />
          <p className="cx-body font-medium text-navy-800">Completed — thank you for this batch.</p>
        </div>
      ) : (
        <button
          onClick={onBeginClick}
          className="mt-8 inline-flex h-11 w-fit items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600"
        >
          {buttonLabel}
          <ArrowRight className="size-4" />
        </button>
      )}
    </div>
  )
}
