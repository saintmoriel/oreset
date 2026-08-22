'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Megaphone, Package, ScrollText, ShieldCheck, TriangleAlert, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StaffRole } from '@oreset/shared'
import { SignOutButton } from '@/components/shared/sign-out-button'

const ROLE_LABELS: Record<StaffRole, string> = {
  admin: 'Admin',
  compliance: 'Compliance Officer',
  reviewer_lead: 'Reviewer Lead',
  qa_reviewer: 'QA Reviewer',
}

export function AdminShell({
  role,
  children,
}: {
  role: StaffRole
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const nav = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, match: '/admin/dashboard' },
    { href: '/admin/campaigns', label: 'Campaign Studio', icon: Megaphone, match: '/admin/campaigns' },
    { href: '/admin/payouts', label: 'Payouts', icon: Wallet, match: '/admin/payouts' },
    { href: '/admin/datasets', label: 'Datasets', icon: Package, match: '/admin/datasets' },
    { href: '/admin/tickets', label: 'Tickets', icon: TriangleAlert, match: '/admin/tickets' },
    { href: '/admin/audit-log', label: 'Audit Log', icon: ScrollText, match: '/admin/audit-log' },
  ]

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border/70 bg-card/80 backdrop-blur-md">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Oreset home">
            <span className="flex size-8 overflow-hidden rounded-md bg-paper-200">
              <Image src="/oreset-logo.png" alt="" width={32} height={32} className="size-8" />
            </span>
            <span className="font-display text-lg font-semibold tracking-display">Oreset</span>
            <span className="ml-1 rounded-full bg-navy-800 px-2 py-0.5 text-caption font-semibold text-white">
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 text-body-sm text-muted-foreground sm:inline-flex">
              <ShieldCheck className="size-4 text-accent" />
              {ROLE_LABELS[role]}
            </span>
            <SignOutButton
              signInPath="/admin"
              className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted-foreground hover:text-foreground"
            />
          </div>
        </div>
      </header>

      <div className="container-wide grid gap-8 py-8 lg:grid-cols-[14rem_1fr] lg:py-10">
        <nav className="flex gap-2 lg:flex-col">
          {nav.map(({ href, label, icon: Icon, match }) => {
            const active = pathname === match || pathname.startsWith(`${match}/`)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2.5 text-body-sm font-medium transition-colors',
                  active ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div>{children}</div>
      </div>
    </div>
  )
}
