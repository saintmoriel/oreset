import { Lock } from 'lucide-react'
import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { LeadsInbox } from '@/components/admin/leads-inbox'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'
import type { Lead } from '@/lib/api/endpoints/leads'

export default async function AdminLeadsPage() {
  const { user } = await serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me')
  const canView = user.staffRole === 'admin'

  let leads: Lead[] = []
  if (canView) {
    ;({ leads } = await serverApiFetch<{ leads: Lead[] }>('/api/v1/admin/leads'))
  }

  return (
    <AdminAppShell>
      <p className="cx-label text-navy-400">Owner · Inbound</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Leads</h1>
      <p className="cx-body mt-2 max-w-2xl text-navy-500">
        Everyone who asked for early access or wrote through the site. Reply from your own email,
        then mark the lead so nothing falls through.
      </p>

      {!canView ? (
        <div className="cx-card mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-navy-100">
            <Lock className="size-5 text-navy-400" />
          </span>
          <p className="cx-body font-semibold text-navy-900">Admin only</p>
        </div>
      ) : (
        <LeadsInbox initialLeads={leads} />
      )}
    </AdminAppShell>
  )
}
