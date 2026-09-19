import { Suspense } from 'react'
import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { AccessCenter } from '@/components/admin/access-center'

export default function AdminAccessPage() {
  return (
    <AdminAppShell>
      <p className="cx-label text-navy-400">Your console</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Access</h1>
      <p className="cx-body mt-2 max-w-2xl text-navy-500">
        Your role gives you a set of modules. If your work needs another one, ask for it here with a reason.
        Whoever holds the People module decides, and the module appears in your menu the moment it is approved.
      </p>
      <Suspense>
        <AccessCenter />
      </Suspense>
    </AdminAppShell>
  )
}
