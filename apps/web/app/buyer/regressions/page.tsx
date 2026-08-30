import { FlaskConical } from 'lucide-react'
import { BuyerAppShell } from '@/components/buyer/buyer-app-shell'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'
import { BuyerRegressionExplorer } from '@/components/buyer/regression-explorer'

export default async function BuyerRegressionsPage() {
  await serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me')

  return (
    <BuyerAppShell>
      <p className="cx-label text-navy-400">CI/CD Integration</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Regression Suite</h1>
      <p className="cx-body mt-2 max-w-lg text-navy-500">
        Auto-generated test cases from rejected and corrected reviews. Use these to build
        regression tests for your AI pipeline. Download as JSON or JSONL.
      </p>

      <BuyerRegressionExplorer />
    </BuyerAppShell>
  )
}
