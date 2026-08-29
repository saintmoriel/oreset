'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Megaphone, Package, ScrollText, TriangleAlert, Wallet, Menu, X, FlaskConical, Target } from 'lucide-react'
import { SignOutButton } from '@/components/shared/sign-out-button'
import { Avatar } from '@/components/capture/avatar'
import { getMe } from '@/lib/api/endpoints/auth'
import { cn } from '@/lib/utils'
import type { AuthUser, StaffRole } from '@oreset/shared'

const ROLE_LABELS: Record<StaffRole, string> = {
  admin: 'Admin',
  compliance: 'Compliance Officer',
  reviewer_lead: 'Reviewer Lead',
  qa_reviewer: 'QA Reviewer',
}

const NAV_ITEMS = [
  { label: 'Home', href: '/admin/home', icon: LayoutDashboard },
  { label: 'Campaigns', href: '/admin/campaigns', icon: Megaphone },
  { label: 'Datasets', href: '/admin/datasets', icon: Package },
  { label: 'Tickets', href: '/admin/tickets', icon: TriangleAlert },
  { label: 'Payouts', href: '/admin/payouts', icon: Wallet },
  { label: 'Regressions', href: '/admin/regressions', icon: FlaskConical },
  { label: 'Calibration', href: '/admin/calibration', icon: Target },
  { label: 'Audit Log', href: '/admin/audit-log', icon: ScrollText },
]

function useActiveNavItem() {
  const pathname = usePathname()
  return NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string
  label: string
  icon: typeof LayoutDashboard
  active: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'cx-body flex items-center gap-2.5 rounded-md px-3 py-2 font-medium cx-fade',
        active ? 'bg-accent/10 text-accent' : 'text-navy-500 hover:bg-navy-100/60 hover:text-navy-800',
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  )
}

function IdentityBlock({ user, className }: { user: AuthUser | null; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Avatar displayName={user?.displayName} className="size-8 text-xs" iconClassName="size-4" />
      <span className="min-w-0">
        <span className="cx-body block truncate font-medium text-navy-900">
          {user?.displayName ?? 'Staff'}
        </span>
        <span className="cx-meta block truncate text-navy-400">
          {user?.staffRole ? ROLE_LABELS[user.staffRole] : ' '}
        </span>
      </span>
    </div>
  )
}

function SidebarContent({
  activeHref,
  user,
  onNavigate,
}: {
  activeHref: string | undefined
  user: AuthUser | null
  onNavigate?: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <Link href="/admin/home" className="flex items-center gap-2 px-4 py-4" aria-label="Oreset home">
        <span className="flex size-6 overflow-hidden rounded shrink-0">
          <Image src="/oreset-logo.png" alt="" width={24} height={24} className="size-6" />
        </span>
        <span className="cx-title text-navy-800">Oreset</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 px-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={activeHref === item.href}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="border-t border-border px-2 py-3">
        <IdentityBlock user={user} className="mb-1 rounded-md px-3 py-2" />
        <SignOutButton
          signInPath="/admin"
          className="cx-body flex w-full items-center gap-2.5 rounded-md px-3 py-2 font-medium text-navy-500 hover:bg-navy-100/60 hover:text-navy-800"
        />
      </div>
    </div>
  )
}

export function AdminAppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const activeItem = useActiveNavItem()

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.user))
      .catch(() => {}) // Header identity is a nicety, not load-bearing — the
    // page's own server-side fetch already gates real content.
  }, [])

  return (
    <div className="min-h-svh bg-background">
      {/* Mobile top bar */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-navy-50 px-4 lg:hidden">
        <Link href="/admin/home" className="flex items-center gap-2" aria-label="Oreset home">
          <span className="flex size-6 overflow-hidden rounded">
            <Image src="/oreset-logo.png" alt="" width={24} height={24} className="size-6" />
          </span>
          <span className="cx-title text-navy-800">Oreset</span>
        </Link>
        <div className="flex items-center gap-2">
          <Avatar displayName={user?.displayName} className="size-8 text-xs" iconClassName="size-4" />
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex size-9 items-center justify-center rounded-md text-navy-500 hover:bg-navy-100/60"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {/* Mobile slide-over */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-900/40 cx-fade"
            onClick={() => setMobileOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setMobileOpen(false)}
            role="presentation"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80vw] border-r border-border bg-navy-50 shadow-lg">
            <div className="flex items-center justify-end px-2 pt-2">
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="flex size-9 items-center justify-center rounded-md text-navy-500 hover:bg-navy-100/60"
              >
                <X className="size-5" />
              </button>
            </div>
            <SidebarContent activeHref={activeItem?.href} user={user} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:flex">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 border-r border-border bg-navy-50 lg:block">
          <div className="sticky top-0 h-svh">
            <SidebarContent activeHref={activeItem?.href} user={user} />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Desktop header bar */}
          <div className="hidden h-14 items-center justify-between border-b border-border px-6 lg:flex">
            <p className="cx-body font-medium text-navy-800">{activeItem?.label ?? 'Oreset'}</p>
            <IdentityBlock user={user} className="rounded-md py-1.5 pl-1.5 pr-3" />
          </div>

          <main className="px-4 py-5 sm:px-6 sm:py-6">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
