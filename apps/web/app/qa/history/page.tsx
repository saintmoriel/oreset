import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import { QaAppShell } from '@/components/qa/qa-app-shell'
import { QaHistoryClient } from '@/components/qa/qa-history-client'
import type { QaDecisionRecord } from '@/lib/api/endpoints/qa'

export default async function QaHistoryPage() {
  let decisions: QaDecisionRecord[]
  try {
    ;({ decisions } = await serverApiFetch<{ decisions: QaDecisionRecord[] }>('/api/v1/qa/me/decisions'))
  } catch (err) {
    redirectIfSignedOut(err, '/qa')
  }

  return (
    <QaAppShell>
      <p className="cx-label text-navy-400">History</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Decisions</h1>

      <div className="mt-6">
        <QaHistoryClient decisions={decisions} />
      </div>
    </QaAppShell>
  )
}
