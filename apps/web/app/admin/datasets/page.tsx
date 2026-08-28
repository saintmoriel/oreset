import Link from 'next/link'
import { Lock } from 'lucide-react'
import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { CreateDatasetClient } from '@/components/admin/create-dataset-client'
import { StatusTag } from '@/components/capture/status-tag'
import { VerificationSeal } from '@/components/capture/verification-seal'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'
import type { DatasetWithRelations } from '@/lib/api/endpoints/datasets'
import type { Campaign } from '@/lib/api/endpoints/campaigns'

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
    <AdminAppShell>
      <p className="cx-label text-navy-400">Origin · Assembly · Provenance Seal · Handoff</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Datasets</h1>

      {!canManage ? (
        <div className="cx-card mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-navy-100">
            <Lock className="size-5 text-navy-400" />
          </span>
          <p className="cx-body font-semibold text-navy-900">Access restricted</p>
          <p className="cx-meta max-w-sm text-navy-500">Your role cannot manage datasets. Admin only.</p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <CreateDatasetClient campaigns={campaigns} />
          </div>

          {datasets.length === 0 ? (
            <p className="cx-body mt-6 text-navy-400">No datasets yet.</p>
          ) : (
            <div className="cx-card mt-6 divide-y divide-border">
              {datasets.map((d) => (
                <Link
                  key={d.id}
                  href={`/admin/datasets/${d.id}`}
                  className="flex items-center justify-between gap-4 p-4 hover:bg-navy-50"
                >
                  <div>
                    <p className="cx-body font-medium text-navy-900">{d.title}</p>
                    <p className="cx-mono-meta mt-0.5 text-navy-400">
                      {d.campaign.title} · {d.items.length} item{d.items.length === 1 ? '' : 's'}
                      {d.buyer ? ` · ${d.buyer.displayName ?? d.buyer.email}` : ''}
                    </p>
                  </div>
                  {d.status === 'draft' ? (
                    <StatusTag tone="neutral">Draft</StatusTag>
                  ) : (
                    <VerificationSeal label={d.status === 'sealed' ? 'Sealed' : 'Delivered'} />
                  )}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </AdminAppShell>
  )
}
