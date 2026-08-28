import { notFound } from 'next/navigation'
import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import { ApiError } from '@/lib/api/client'
import { CaptureAppShell } from '@/components/capture/capture-app-shell'
import { BatchDetailClient } from '@/components/capture/batch-detail-client'
import type { Batch } from '@/lib/api/endpoints/batches'
import type { SubmissionSummary } from '@/lib/api/endpoints/submissions'

export default async function CaptureBatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let batch: Batch
  let submissions: SubmissionSummary[]
  try {
    ;({ batch } = await serverApiFetch<{ batch: Batch }>(`/api/v1/batches/${id}`))
    ;({ submissions } = await serverApiFetch<{ submissions: SubmissionSummary[] }>('/api/v1/submissions/me'))
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    redirectIfSignedOut(err, '/capture')
  }

  return (
    <CaptureAppShell>
      <BatchDetailClient batch={batch} submissions={submissions} />
    </CaptureAppShell>
  )
}
