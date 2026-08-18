'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Lock, Plus } from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { CAMPAIGNS, ROLES, type RoleId } from '@/lib/admin-mock-data'
import { cn } from '@/lib/utils'

const STATUS_BADGE = {
  live: 'bg-success/10 text-success',
  paused: 'bg-warning/10 text-warning',
  draft: 'bg-muted text-muted-foreground',
} as const

function CampaignsContent() {
  const params = useSearchParams()
  const role = (ROLES.find((r) => r.id === params.get('role'))?.id ?? 'admin') as RoleId
  const roleInfo = ROLES.find((r) => r.id === role) ?? ROLES[0]

  return (
    <AdminShell role={role}>
      <div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-eyebrow text-accent">Origin · Sourcing</p>
            <h1 className="text-h2 mt-2 text-foreground">Campaign Studio</h1>
          </div>
          {roleInfo.canManageCampaigns && (
            <Link
              href={`/admin/campaigns/new?role=${role}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-copper-600"
            >
              <Plus className="size-4" />
              New Campaign
            </Link>
          )}
        </div>

        {!roleInfo.canManageCampaigns ? (
          <div className="card-surface mt-6 flex flex-col items-center gap-3 p-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <Lock className="size-5 text-muted-foreground" />
            </span>
            <p className="text-body font-semibold text-foreground">Access restricted</p>
            <p className="text-body-sm max-w-sm text-muted-foreground">
              The <strong className="font-medium text-foreground">{roleInfo.label}</strong> role
              cannot create or manage campaigns. Switch to Admin.
            </p>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-border/70 border-y border-border/70">
            {CAMPAIGNS.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-body-sm font-medium text-foreground">{c.title}</p>
                  <p className="text-caption mt-0.5 text-muted-foreground">
                    {c.mediaType} · {c.language}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-caption font-semibold capitalize',
                    STATUS_BADGE[c.status],
                  )}
                >
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminShell>
  )
}

export default function CampaignsPage() {
  return (
    <Suspense>
      <CampaignsContent />
    </Suspense>
  )
}
