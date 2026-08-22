import { serverApiFetch } from '@/lib/api/server'
import { CaptureAppShell } from '@/components/capture/capture-app-shell'
import { SubmissionsClient } from '@/components/capture/submissions-client'
import type { SubmissionSummary } from '@/lib/api/endpoints/submissions'

export default async function CaptureSubmissionsPage() {
  const { submissions } = await serverApiFetch<{ submissions: SubmissionSummary[] }>('/api/v1/submissions/me')

  return (
    <CaptureAppShell active="submissions">
      <p className="cx-label text-navy-400">History</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Submissions</h1>

      <div className="mt-6">
        <SubmissionsClient submissions={submissions} />
      </div>
    </CaptureAppShell>
  )
}
