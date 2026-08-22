'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useCaptureSession } from '@/components/capture/capture-session-context'
import { ConsentStep } from '@/components/capture/steps/consent-step'
import { TaskStep } from '@/components/capture/steps/task-step'
import { ReviewStep } from '@/components/capture/steps/review-step'
import { ValidationStep } from '@/components/capture/steps/validation-step'
import { CompleteStep } from '@/components/capture/steps/complete-step'
import { cn } from '@/lib/utils'
import type { Batch } from '@/lib/api/endpoints/batches'

export type PanelStep = 'consent' | 'task' | 'review' | 'validation' | 'complete'

const TRACKED_STEPS: { key: PanelStep; label: string }[] = [
  { key: 'consent', label: 'Consent' },
  { key: 'task', label: 'Capture' },
  { key: 'review', label: 'Review' },
  { key: 'validation', label: 'Validate' },
  { key: 'complete', label: 'Done' },
]

function StepTracker({ step }: { step: PanelStep }) {
  const current = TRACKED_STEPS.findIndex((s) => s.key === step)
  return (
    <ol className="flex items-center gap-1.5">
      {TRACKED_STEPS.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'upcoming'
        return (
          <li key={s.key} className="flex items-center gap-1.5">
            <span
              className={cn(
                'flex items-center gap-1.5 rounded px-1.5 py-0.5',
                state === 'active' && 'bg-navy-800 text-white',
                state === 'done' && 'text-navy-500',
                state === 'upcoming' && 'text-navy-300',
              )}
            >
              <span className="cx-label font-mono">{String(i + 1).padStart(2, '0')}</span>
              <span className="cx-meta hidden font-medium sm:inline">{s.label}</span>
            </span>
            {i < TRACKED_STEPS.length - 1 && <span className="h-px w-3 shrink-0 bg-border sm:w-5" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}

export function CapturePanel({
  batch,
  initialStep = 'consent',
  onExit,
}: {
  batch: Batch
  initialStep?: PanelStep
  onExit: () => void
}) {
  const { reset, resetItem } = useCaptureSession()
  const [step, setStep] = useState<PanelStep>(initialStep)
  const [isRetake, setIsRetake] = useState(false)

  function handleCancel() {
    reset()
    onExit()
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <p className="cx-label text-navy-400">Recording</p>
          <p className="cx-title text-navy-900">{batch.title}</p>
        </div>
        <button
          onClick={handleCancel}
          aria-label="Cancel session"
          className="flex size-8 items-center justify-center rounded-md text-navy-400 hover:bg-navy-50 hover:text-navy-800"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="border-b border-border py-3">
        <StepTracker step={step} />
      </div>

      <div className="pt-6">
        {step === 'consent' && <ConsentStep onBack={onExit} onNext={() => setStep('task')} />}
        {step === 'task' && (
          <TaskStep isRetake={isRetake} onBack={() => setStep('consent')} onNext={() => setStep('review')} />
        )}
        {step === 'review' && <ReviewStep onBack={() => setStep('task')} onNext={() => setStep('validation')} />}
        {step === 'validation' && (
          <ValidationStep
            onNext={() => setStep('complete')}
            onRetake={() => {
              setIsRetake(true)
              setStep('task')
            }}
          />
        )}
        {step === 'complete' && (
          <CompleteStep
            onCaptureNext={() => {
              setIsRetake(false)
              resetItem()
              setStep('task')
            }}
            onEnd={handleCancel}
          />
        )}
      </div>
    </div>
  )
}
