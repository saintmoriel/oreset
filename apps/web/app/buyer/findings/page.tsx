import { BuyerAppShell } from '@/components/buyer/buyer-app-shell'
import { FindingsList } from '@/components/buyer/findings-list'
import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import type { ClientFindingsResponse } from '@/lib/api/endpoints/findings'

export default async function BuyerFindingsPage() {
  let data: ClientFindingsResponse
  try {
    data = await serverApiFetch<ClientFindingsResponse>('/api/v1/buyer/findings')
  } catch (err) {
    redirectIfSignedOut(err, '/buyer')
  }

  return (
    <BuyerAppShell>
      <p className="cx-label text-navy-400">Engagement</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Findings</h1>
      <p className="cx-body mt-2 max-w-2xl text-navy-500">
        Every confirmed vulnerability in your AI agent, verified by a lead auditor, with reproduction
        steps and a recommended fix. Patch it, mark it fixed, and we retest at no extra cost. A finding
        closes only when the attack no longer lands.
      </p>

      <FindingsList initial={data} />
    </BuyerAppShell>
  )
}
