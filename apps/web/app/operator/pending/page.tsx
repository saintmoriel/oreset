'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock, LogOut } from 'lucide-react'
import { getMe, logout } from '@/lib/api/endpoints/auth'
import type { AuthUser } from '@oreset/shared'

// Where a pending applicant lands after sign-in. Nothing in the portal is
// reachable until a lead approves them, so this page says exactly that.
export default function OperatorPendingPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    getMe()
      .then(({ user }) => {
        if (user.status === 'active') router.replace('/operator/home')
        else setUser(user)
      })
      .catch(() => router.replace('/operator'))
  }, [router])

  async function signOut() {
    await logout().catch(() => undefined)
    router.replace('/operator')
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border/70 bg-card/80 backdrop-blur-md">
        <div className="container-narrow flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Oreset home">
            <span className="flex size-8 overflow-hidden rounded-md bg-paper-200">
              <Image src="/oreset-logo.png" alt="" width={32} height={32} className="size-8" />
            </span>
            <span className="font-display text-lg font-semibold tracking-display">Oreset</span>
          </Link>
          <button type="button" onClick={signOut} className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted-foreground hover:text-foreground">
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </header>

      <main className="container-narrow py-16 sm:py-24">
        <div className="cx-card p-8 sm:p-10">
          <span className="flex size-12 items-center justify-center rounded-xl bg-warning/10">
            <Clock className="size-6 text-warning" />
          </span>
          <p className="cx-label mt-6 text-accent">Oreset Red Team</p>
          <h1 className="cx-page-title mt-2 text-navy-900">Your application is under review</h1>
          <p className="cx-body mt-3 text-navy-500">
            {user?.displayName ? `Thanks, ${user.displayName.split(' ')[0]}. ` : ''}A lead auditor reviews every application
            before anyone sees client scenarios. Most decisions take a few working days. You will get an email either way.
          </p>

          <div className="mt-6 rounded-lg border border-border bg-navy-50/50 p-4">
            <p className="cx-meta font-semibold text-navy-700">What happens after approval</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 cx-meta text-navy-600">
              <li>Sign the NDA, code of conduct, and data handling policy.</li>
              <li>Pass two calibration scenarios with known answers.</li>
              <li>Your live queue opens.</li>
            </ol>
          </div>

          <p className="cx-meta mt-6 text-navy-400">
            Questions? Reply to your application confirmation email or write to{' '}
            <a href="mailto:redteam@oreset.africa" className="font-semibold text-accent">redteam@oreset.africa</a>.
          </p>
        </div>
      </main>
    </div>
  )
}
