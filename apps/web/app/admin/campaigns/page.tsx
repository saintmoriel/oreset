import Link from 'next/link'
import { Lock, Plus } from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { cn } from '@/lib/utils'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'
import type { Campaign } from '@/lib/api/endpoints/campaigns'

const STATUS_BADGE = {
  live: 'bg-success/10 text-success',
  paused: 'bg-warning/10 text-warning',
  draft: 'bg-muted text-muted-foreground',
} as const

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
    <AdminShell role={role}>
      <div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-eyebrow text-accent">Origin · Sourcing</p>
            <h1 className="text-h2 mt-2 text-foreground">Campaign Studio</h1>
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
          <div className="card-surface mt-6 flex flex-col items-center gap-3 p-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <Lock className="size-5 text-muted-foreground" />
            </span>
            <p className="text-body font-semibold text-foreground">Access restricted</p>
            <p className="text-body-sm max-w-sm text-muted-foreground">
              Your role cannot create or manage campaigns. Admin only.
            </p>
          </div>
        ) : campaigns.length === 0 ? (
          <p className="mt-6 text-body-sm text-muted-foreground">No campaigns yet.</p>
        ) : (
          <ul className="mt-6 divide-y divide-border/70 border-y border-border/70">
            {campaigns.map((c) => {
              const batch = c.batches[0]
              return (
                <li key={c.id} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-body-sm font-medium text-foreground">{c.title}</p>
                    <p className="text-caption mt-0.5 text-muted-foreground">
                      {c.mediaType} · {c.language ?? 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {batch && (
                      <Link
                        href={`/admin/batches/${batch.id}/prompts`}
                        className="text-caption font-semibold text-accent hover:text-copper-600"
                      >
                        Prompts
                      </Link>
                    )}
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-caption font-semibold capitalize',
                        STATUS_BADGE[c.status],
                      )}
                    >
                      {c.status}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </AdminShell>
  )
}
