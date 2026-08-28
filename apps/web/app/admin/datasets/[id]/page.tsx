import { Lock } from 'lucide-react'
import { AdminAppShell } from '@/components/admin/admin-app-shell'
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
      <AdminAppShell>
        <div className="cx-card flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-navy-100">
            <Lock className="size-5 text-navy-400" />
          </span>
          <p className="cx-body font-semibold text-navy-900">Access restricted</p>
          <p className="cx-meta max-w-sm text-navy-500">Your role cannot manage datasets. Admin only.</p>
        </div>
      </AdminAppShell>
    )
  }

  const [{ dataset }, { buyers }] = await Promise.all([
    serverApiFetch<{ dataset: DatasetWithRelations }>(`/api/v1/admin/datasets/${id}`),
    serverApiFetch<{ buyers: Buyer[] }>('/api/v1/admin/buyers'),
  ])

  return (
    <AdminAppShell>
      <DatasetAssemblyClient dataset={dataset} buyers={buyers} />
    </AdminAppShell>
  )
}
