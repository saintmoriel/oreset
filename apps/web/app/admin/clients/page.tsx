import { Lock } from 'lucide-react'
import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { ClientsDirectory } from '@/components/admin/clients-directory'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'
import type { Client } from '@/lib/api/endpoints/people'

export default async function AdminClientsPage() {
  const { user } = await serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me')
  const canView = user.staffRole === 'admin'

  let clients: Client[] = []
  if (canView) {
    ;({ clients } = await serverApiFetch<{ clients: Client[] }>('/api/v1/admin/clients'))
  }

  return (
    <AdminAppShell>
      <p className="cx-label text-navy-400">Owner · Clients</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Clients</h1>
      <p className="cx-body mt-2 max-w-2xl text-navy-500">
        Every client organisation, what we have found for them, where their fixes stand, and what they
        have paid. Provision a new client here; they sign in at /buyer.
      </p>

      {!canView ? (
        <div className="cx-card mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-navy-100">
            <Lock className="size-5 text-navy-400" />
          </span>
          <p className="cx-body font-semibold text-navy-900">Admin only</p>
        </div>
      ) : (
        <ClientsDirectory initialClients={clients} />
      )}
    </AdminAppShell>
  )
}
