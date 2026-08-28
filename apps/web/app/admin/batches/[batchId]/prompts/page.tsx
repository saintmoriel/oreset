import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { PromptsForgeClient } from '@/components/admin/prompts-forge-client'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'

export default async function BatchPromptsPage({
  params,
}: {
  params: Promise<{ batchId: string }>
}) {
  const { batchId } = await params
  const { user } = await serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me')
  const role = user.staffRole!

  return (
    <AdminAppShell>
      <p className="cx-label text-navy-400">Origin · Task Forge</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Prompt authoring</h1>
      <p className="cx-body mt-2 text-navy-500">
        These are shown to contributors one at a time as they work through this batch.
      </p>

      {role === 'admin' ? (
        <PromptsForgeClient batchId={batchId} />
      ) : (
        <p className="cx-body mt-6 text-navy-400">Only Admin can author prompts.</p>
      )}
    </AdminAppShell>
  )
}
