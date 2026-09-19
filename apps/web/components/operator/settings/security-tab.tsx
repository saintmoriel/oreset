'use client'

import Link from 'next/link'
import { KeyRound } from 'lucide-react'
import { TwoFactorPanel } from '@/components/shared/two-factor-panel'

export function SecurityTab() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-navy-900">Two-factor authentication</p>
        <p className="mt-0.5 text-xs text-navy-400">
          Your account gives access to client systems. With two-factor on, a stolen password alone cannot open it. The Identity and
          Account Undertaking asks you to turn it on.
        </p>
        <TwoFactorPanel />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold text-navy-900">Password</p>
        <p className="mt-0.5 text-xs text-navy-400">
          To change your password we send a reset link to your email, so a stolen open session cannot lock you out of your own account.
        </p>
        <Link
          href="/forgot-password?portal=operator"
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50"
        >
          <KeyRound className="size-4" /> Send me a reset link
        </Link>
      </div>
    </div>
  )
}
