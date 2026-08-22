import Link from 'next/link'
import { Lock } from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { CreateDatasetClient } from '@/components/admin/create-dataset-client'
import { cn } from '@/lib/utils'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'
import type { DatasetWithRelations } from '@/lib/api/endpoints/datasets'
import type { Campaign } from '@/lib/api/endpoints/campaigns'

const STATUS_BADGE = {
  draft: 'bg-muted text-muted-foreground',
  sealed: 'bg-warning/10 text-warning',
  delivered: 'bg-success/10 text-success',
} as const

export default async function DatasetsPage() {
  const { user } = await serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me')
  const role = user.staffRole!
  const canManage = role === 'admin'

  const [datasets, campaigns] = canManage
    ? await Promise.all([
        serverApiFetch<{ datasets: DatasetWithRelations[] }>('/api/v1/admin/datasets').then((r) => r.datasets),
        serverApiFetch<{ campaigns: Campaign[] }>('/api/v1/campaigns').then((r) => r.campaigns),
      ])
    : [[], []]

  return (
    <AdminShell role={role}>
      <div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-eyebrow text-accent">Origin · Assembly · Provenance Seal · Handoff</p>
            <h1 className="text-h2 mt-2 text-foreground">Datasets</h1>
          </div>
        </div>

        {!canManage ? (
          <div className="card-surface mt-6 flex flex-col items-center gap-3 p-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <Lock className="size-5 text-muted-foreground" />
            </span>
            <p className="text-body font-semibold text-foreground">Access restricted</p>
            <p className="text-body-sm max-w-sm text-muted-foreground">
              Your role cannot manage datasets. Admin only.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6">
              <CreateDatasetClient campaigns={campaigns} />
            </div>

            {datasets.length === 0 ? (
              <p className="mt-6 text-body-sm text-muted-foreground">No datasets yet.</p>
            ) : (
              <ul className="mt-6 divide-y divide-border/70 border-y border-border/70">
                {datasets.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-4 py-4">
                    <Link href={`/admin/datasets/${d.id}`} className="flex-1">
                      <p className="text-body-sm font-medium text-foreground">{d.title}</p>
                      <p className="text-caption mt-0.5 text-muted-foreground">
                        {d.campaign.title} · {d.items.length} item{d.items.length === 1 ? '' : 's'}
                        {d.buyer ? ` · ${d.buyer.displayName ?? d.buyer.email}` : ''}
                      </p>
                    </Link>
                    <span className={cn('rounded-full px-2.5 py-1 text-caption font-semibold capitalize', STATUS_BADGE[d.status])}>
                      {d.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </AdminShell>
  )
}
