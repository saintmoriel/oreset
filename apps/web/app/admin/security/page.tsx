import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { TwoFactorPanel } from '@/components/shared/two-factor-panel'

export default function AdminSecurityPage() {
  return (
    <AdminAppShell>
      <p className="cx-label text-navy-400">Your account</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Security</h1>
      <p className="cx-body mt-2 max-w-2xl text-navy-500">
        Two-factor authentication is required for every staff account (Security Policy, section 3.1). With it on, a stolen
        password alone cannot open your console.
      </p>
      <TwoFactorPanel />
    </AdminAppShell>
  )
}
