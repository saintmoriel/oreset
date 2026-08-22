import { Lock } from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { PayoutsAdminClient } from '@/components/admin/payouts-admin-client'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'

export default async function AdminPayoutsPage() {
  const { user } = await serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me')
  const role = user.staffRole!
  const canManage = role === 'admin'

  return (
    <AdminShell role={role}>
      <div>
        <p className="text-eyebrow text-accent">Compliance &amp; payments</p>
        <h1 className="text-h2 mt-2 text-foreground">Payouts &amp; retention</h1>
        <p className="text-body-sm mt-2 max-w-lg text-muted-foreground">
          Run a payout batch to pay contributors for approved submissions, or trigger a retention
          sweep to purge media past the retention window.
        </p>

        {!canManage ? (
          <div className="card-surface mt-6 flex flex-col items-center gap-3 p-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <Lock className="size-5 text-muted-foreground" />
            </span>
            <p className="text-body font-semibold text-foreground">Access restricted</p>
            <p className="text-body-sm max-w-sm text-muted-foreground">
              Your role cannot run payout or retention batches. Admin only.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <PayoutsAdminClient />
          </div>
        )}
      </div>
    </AdminShell>
  )
}
