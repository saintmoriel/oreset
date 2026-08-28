'use client'

import { useState } from 'react'
import { BatchDetailStep } from '@/components/capture/steps/batch-detail-step'
import { CapturePanel } from '@/components/capture/capture-panel'
import { useCaptureSession } from '@/components/capture/capture-session-context'
import { inferResumeStep } from '@/lib/infer-resume-step'
import type { Batch } from '@/lib/api/endpoints/batches'
import type { SubmissionSummary } from '@/lib/api/endpoints/submissions'

// This is the only place CapturePanel ever opens from — every other entry
// point (Batches list, Home's resume banner, Submissions' Retake) is a
// plain <Link> to this page.
export function BatchDetailClient({ batch, submissions }: { batch: Batch; submissions: SubmissionSummary[] }) {
  const { session } = useCaptureSession()
  const [active, setActive] = useState(false)

  const ownSubmissions = submissions.filter((s) => s.batch.id === batch.id)
  const hasOutstandingFailure = ownSubmissions.some((s) => s.status === 'submitted' || s.status === 'qa_rejected')
  const completed = ownSubmissions.length >= batch.itemCount && !hasOutstandingFailure
  const isResuming = session.batchId === batch.id

  if (active) {
    return (
      <CapturePanel
        batch={batch}
        initialStep={isResuming ? inferResumeStep(session) : 'consent'}
        onExit={() => setActive(false)}
      />
    )
  }

  return (
    <BatchDetailStep
      batch={batch}
      onBegin={() => setActive(true)}
      buttonLabel={isResuming ? 'Continue session' : 'Begin session'}
      completed={completed && !isResuming}
    />
  )
}
