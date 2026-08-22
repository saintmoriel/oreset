import { AdminShell } from '@/components/admin/admin-shell'
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
    <AdminShell role={role}>
      <div>
        <p className="text-eyebrow text-accent">Origin · Task Forge</p>
        <h1 className="text-h2 mt-2 text-foreground">Prompt authoring</h1>
        <p className="text-body-sm mt-1 text-muted-foreground">
          These are shown to contributors one at a time as they work through this batch.
        </p>

        {role === 'admin' ? (
          <PromptsForgeClient batchId={batchId} />
        ) : (
          <p className="mt-6 text-body-sm text-muted-foreground">Only Admin can author prompts.</p>
        )}
      </div>
    </AdminShell>
  )
}
