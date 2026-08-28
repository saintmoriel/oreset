import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import { CaptureAppShell } from '@/components/capture/capture-app-shell'
import { SubmissionsClient } from '@/components/capture/submissions-client'
import type { SubmissionSummary } from '@/lib/api/endpoints/submissions'

export default async function CaptureSubmissionsPage() {
  let submissions: SubmissionSummary[]
  try {
    ;({ submissions } = await serverApiFetch<{ submissions: SubmissionSummary[] }>('/api/v1/submissions/me'))
  } catch (err) {
    redirectIfSignedOut(err, '/capture')
  }

  return (
    <CaptureAppShell>
      <p className="cx-label text-navy-400">History</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Submissions</h1>

      <div className="mt-6">
        <SubmissionsClient submissions={submissions} />
      </div>
    </CaptureAppShell>
  )
}
