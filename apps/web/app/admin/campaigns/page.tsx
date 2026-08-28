import Link from 'next/link'
import { Lock, Plus } from 'lucide-react'
import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { StatusTag } from '@/components/capture/status-tag'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'
import type { Campaign } from '@/lib/api/endpoints/campaigns'

export default async function CampaignsPage() {
  const { user } = await serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me')
  const role = user.staffRole!
  const canManage = role === 'admin'

  // GET /api/v1/campaigns is staff:admin-only, but proxy.ts lets
  // compliance/reviewer_lead reach this page generally — fetching it
  // unconditionally (e.g. via Promise.all) would throw an uncaught 403 for
  // those roles and crash the page instead of showing "Access restricted".
  const campaigns = canManage
    ? (await serverApiFetch<{ campaigns: Campaign[] }>('/api/v1/campaigns')).campaigns
    : []

  return (
    <AdminAppShell>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="cx-label text-navy-400">Origin · Sourcing</p>
          <h1 className="cx-page-title mt-1.5 text-navy-900">Campaign Studio</h1>
        </div>
        {canManage && (
          <Link
            href="/admin/campaigns/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-copper-600"
          >
            <Plus className="size-4" />
            New Campaign
          </Link>
        )}
      </div>

      {!canManage ? (
        <div className="cx-card mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-navy-100">
            <Lock className="size-5 text-navy-400" />
          </span>
          <p className="cx-body font-semibold text-navy-900">Access restricted</p>
          <p className="cx-meta max-w-sm text-navy-500">
            Your role cannot create or manage campaigns. Admin only.
          </p>
        </div>
      ) : campaigns.length === 0 ? (
        <p className="cx-body mt-6 text-navy-400">No campaigns yet.</p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => {
            const batch = c.batches[0]
            return (
              <div key={c.id} className="cx-card flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <p className="cx-mono-meta font-semibold uppercase tracking-wider text-navy-400">
                    {c.mediaType}
                  </p>
                  <StatusTag tone={c.status === 'live' ? 'success' : c.status === 'paused' ? 'warning' : 'neutral'}>
                    {c.status}
                  </StatusTag>
                </div>
                <div>
                  <h2 className="cx-title text-navy-900">{c.title}</h2>
                  <p className="cx-mono-meta mt-0.5 text-navy-400">{c.language ?? 'N/A'}</p>
                </div>
                {batch && (
                  <Link
                    href={`/admin/batches/${batch.id}/prompts`}
                    className="cx-meta font-semibold text-accent hover:text-copper-600"
                  >
                    Prompts →
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </AdminAppShell>
  )
}
