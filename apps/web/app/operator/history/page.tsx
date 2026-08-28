import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import { OperatorAppShell } from '@/components/operator/operator-app-shell'
import { OperatorHistoryClient } from '@/components/operator/operator-history-client'
import type { OperatorDecisionRecord } from '@/lib/api/endpoints/operator'

export default async function OperatorHistoryPage() {
  let decisions: OperatorDecisionRecord[]
  try {
    ;({ decisions } = await serverApiFetch<{ decisions: OperatorDecisionRecord[] }>(
      '/api/v1/operator/me/decisions',
    ))
  } catch (err) {
    redirectIfSignedOut(err, '/operator')
  }

  return (
    <OperatorAppShell>
      <p className="cx-label text-navy-400">History</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Decisions</h1>

      <div className="mt-6">
        <OperatorHistoryClient decisions={decisions} />
      </div>
    </OperatorAppShell>
  )
}
