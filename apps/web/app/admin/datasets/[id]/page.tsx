import { Lock } from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { DatasetAssemblyClient } from '@/components/admin/dataset-assembly-client'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'
import type { DatasetWithRelations, Buyer } from '@/lib/api/endpoints/datasets'

export default async function DatasetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user } = await serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me')
  const role = user.staffRole!
  const canManage = role === 'admin'

  if (!canManage) {
    return (
      <AdminShell role={role}>
        <div className="card-surface flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-muted">
            <Lock className="size-5 text-muted-foreground" />
          </span>
          <p className="text-body font-semibold text-foreground">Access restricted</p>
          <p className="text-body-sm max-w-sm text-muted-foreground">
            Your role cannot manage datasets. Admin only.
          </p>
        </div>
      </AdminShell>
    )
  }

  const [{ dataset }, { buyers }] = await Promise.all([
    serverApiFetch<{ dataset: DatasetWithRelations }>(`/api/v1/admin/datasets/${id}`),
    serverApiFetch<{ buyers: Buyer[] }>('/api/v1/admin/buyers'),
  ])

  return (
    <AdminShell role={role}>
      <DatasetAssemblyClient dataset={dataset} buyers={buyers} />
    </AdminShell>
  )
}
