import { Lock } from 'lucide-react'
import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { PeopleDirectory } from '@/components/admin/people-directory'
import { serverApiFetch } from '@/lib/api/server'
import type { AuthUser } from '@oreset/shared'
import type { Person, RoleAccess } from '@/lib/api/endpoints/people'

export default async function AdminPeoplePage() {
  const { user } = await serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me')
  const canView = user.staffRole === 'admin'

  let users: Person[] = []
  let roles: RoleAccess = {}
  if (canView) {
    ;({ users, roles } = await serverApiFetch<{ users: Person[]; roles: RoleAccess }>('/api/v1/admin/people'))
  }

  return (
    <AdminAppShell>
      <p className="cx-label text-navy-400">Owner · People and access</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">People</h1>
      <p className="cx-body mt-2 max-w-2xl text-navy-500">
        Every account on the platform: staff, red team testers, and clients. What each role can reach,
        who has actually signed in, and the controls to suspend an account or force a password reset.
        Passwords themselves are never visible to anyone, by design.
      </p>

      {!canView ? (
        <div className="cx-card mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-navy-100">
            <Lock className="size-5 text-navy-400" />
          </span>
          <p className="cx-body font-semibold text-navy-900">Admin only</p>
        </div>
      ) : (
        <PeopleDirectory initialUsers={users} roles={roles} currentUserId={user.id} />
      )}
    </AdminAppShell>
  )
}
