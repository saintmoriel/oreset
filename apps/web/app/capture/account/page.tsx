import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import { CaptureAppShell } from '@/components/capture/capture-app-shell'
import { SignOutButton } from '@/components/shared/sign-out-button'
import { Avatar } from '@/components/capture/avatar'
import { StatusTag } from '@/components/capture/status-tag'
import { maskPhone, computeStreak } from '@/lib/capture-format'
import type { AuthUser } from '@oreset/shared'
import type { SubmissionSummary } from '@/lib/api/endpoints/submissions'

export default async function CaptureAccountPage() {
  let user: AuthUser
  let submissions: SubmissionSummary[]
  try {
    ;[{ user }, { submissions }] = await Promise.all([
      serverApiFetch<{ user: AuthUser }>('/api/v1/auth/me'),
      serverApiFetch<{ submissions: SubmissionSummary[] }>('/api/v1/submissions/me'),
    ])
  } catch (err) {
    redirectIfSignedOut(err, '/capture')
  }
  const streak = computeStreak(submissions.map((s) => s.createdAt))
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const identityFacts = [
    { label: 'Name', value: user.displayName ?? '—' },
    { label: 'Phone', value: user.phone ? maskPhone(user.phone) : '—' },
    { label: 'Role', value: 'Contributor' },
  ]

  return (
    <CaptureAppShell>
      <p className="cx-label text-navy-400">Identity</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Account</h1>

      <div className="mt-6 flex items-center gap-4">
        <Avatar displayName={user.displayName} className="size-16 text-xl" iconClassName="size-7" />
        <div className="min-w-0">
          <p className="cx-title truncate text-navy-900">{user.displayName ?? 'Contributor'}</p>
          <p className="cx-body text-navy-500">{user.phone ? maskPhone(user.phone) : '—'}</p>
        </div>
        <StatusTag tone={user.status === 'active' ? 'success' : 'neutral'}>{user.status}</StatusTag>
      </div>

      <div className="cx-card mt-6 grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="cx-meta text-navy-400">Total submissions</p>
          <p className="cx-stat mt-1 text-navy-900">{submissions.length}</p>
        </div>
        <div className="p-5">
          <p className="cx-meta text-navy-400">Current streak</p>
          <p className="cx-stat mt-1 text-navy-900">
            {streak}
            <span className="cx-body font-sans font-normal text-navy-400"> day{streak === 1 ? '' : 's'}</span>
          </p>
        </div>
        <div className="p-5">
          <p className="cx-meta text-navy-400">Verified since</p>
          <p className="cx-stat mt-1 text-navy-900">{memberSince}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:items-start">
        <div>
          <p className="cx-title text-navy-800">Profile</p>
          <div className="cx-card mt-2.5 divide-y divide-border">
            {identityFacts.map((fact) => (
              <div key={fact.label} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="cx-meta font-medium text-navy-400">{fact.label}</span>
                <span className="cx-body capitalize text-navy-900">{fact.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="cx-title text-navy-800">Session</p>
          <div className="cx-card mt-2.5 p-5">
            <p className="cx-body text-navy-500">
              Sign out to end your current session on this device. You&apos;ll need your phone number
              and a fresh code to sign back in.
            </p>
            <div className="mt-4">
              <SignOutButton
                signInPath="/capture"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium text-navy-800 hover:bg-navy-50"
              />
            </div>
          </div>
        </div>
      </div>
    </CaptureAppShell>
  )
}
