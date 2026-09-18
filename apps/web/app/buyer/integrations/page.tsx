import { BuyerAppShell } from '@/components/buyer/buyer-app-shell'
import { IntegrationsPanel } from '@/components/buyer/integrations-panel'
import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import type { ApiToken, WebhookConfig } from '@/lib/api/endpoints/integrations'

export default async function BuyerIntegrationsPage() {
  let tokens: ApiToken[] = []
  let webhooks: WebhookConfig[] = []
  try {
    ;[{ tokens }, { webhooks }] = await Promise.all([
      serverApiFetch<{ tokens: ApiToken[] }>('/api/v1/buyer/api-tokens'),
      serverApiFetch<{ webhooks: WebhookConfig[] }>('/api/v1/buyer/webhooks'),
    ])
  } catch (err) {
    redirectIfSignedOut(err, '/buyer')
  }

  return (
    <BuyerAppShell>
      <p className="cx-label text-navy-400">Engagement</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Integrations</h1>
      <p className="cx-body mt-2 max-w-2xl text-navy-500">
        Pull the regression suite from your CI with an API token, and push finding events into
        Slack, Jira, or anything else that accepts a webhook. Tokens are read-only; webhooks carry
        a signature you can verify.
      </p>

      <IntegrationsPanel initialTokens={tokens} initialWebhooks={webhooks} />
    </BuyerAppShell>
  )
}
