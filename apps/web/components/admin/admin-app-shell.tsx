'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ScrollText, TriangleAlert, Wallet, Menu, X, FlaskConical, Target, GitCompare, Users, ShieldAlert, Building2, UserCog, Inbox, KeyRound } from 'lucide-react'
import { SignOutButton } from '@/components/shared/sign-out-button'
import { Avatar } from '@/components/capture/avatar'
import { getMe } from '@/lib/api/endpoints/auth'
import { getMyAccess } from '@/lib/api/endpoints/access'
import { cn } from '@/lib/utils'
import { STAFF_ROLE_LABELS, type AdminModule, type AuthUser } from '@oreset/shared'

// Each item names the module that unlocks it. Items with no module are
// visible to every staff member.
const NAV_ITEMS: { label: string; href: string; icon: typeof LayoutDashboard; module?: AdminModule }[] = [
  { label: 'Home', href: '/admin/home', icon: LayoutDashboard },
  { label: 'Leads', href: '/admin/leads', icon: Inbox, module: 'leads' },
  { label: 'Findings', href: '/admin/findings', icon: ShieldAlert, module: 'findings' },
  { label: 'Escalations', href: '/admin/tickets', icon: TriangleAlert, module: 'escalations' },
  { label: 'Consensus', href: '/admin/consensus', icon: GitCompare, module: 'consensus' },
  { label: 'Calibration', href: '/admin/calibration', icon: Target, module: 'calibration' },
  { label: 'Regressions', href: '/admin/regressions', icon: FlaskConical, module: 'regressions' },
  { label: 'Testers', href: '/admin/testers', icon: Users, module: 'testers' },
  { label: 'Clients', href: '/admin/clients', icon: Building2, module: 'clients' },
  { label: 'People', href: '/admin/people', icon: UserCog, module: 'people' },
  { label: 'Payouts', href: '/admin/payouts', icon: Wallet, module: 'payouts' },
  { label: 'Audit Log', href: '/admin/audit-log', icon: ScrollText, module: 'audit' },
  { label: 'Access', href: '/admin/access', icon: KeyRound },
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
          {user?.staffRole ? STAFF_ROLE_LABELS[user.staffRole] : ' '}
        </span>
      </span>
    </div>
  )
}

function SidebarContent({
  activeHref,
  user,
  modules,
  onNavigate,
}: {
  activeHref: string | undefined
  user: AuthUser | null
  modules: AdminModule[] | null
  onNavigate?: () => void
}) {
  // Until access loads, show only the always-visible items so nothing
  // flashes and then disappears.
  const visible = NAV_ITEMS.filter((item) => !item.module || (modules ?? []).includes(item.module))
  const hiddenCount = NAV_ITEMS.length - visible.length

  return (
    <div className="flex h-full flex-col">
      <Link href="/admin/home" className="flex items-center gap-2 px-4 py-4" aria-label="Oreset home">
        <span className="flex size-6 overflow-hidden rounded shrink-0">
          <Image src="/oreset-logo.png" alt="" width={24} height={24} className="size-6" />
        </span>
        <span className="cx-title text-navy-800">Oreset</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 px-2">
        {visible.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={activeHref === item.href}
            onNavigate={onNavigate}
          />
        ))}
        {modules && hiddenCount > 0 && (
          <p className="cx-meta mt-2 px-3 text-navy-400">
            {hiddenCount} more {hiddenCount === 1 ? 'module' : 'modules'} can be requested under Access.
          </p>
        )}
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
  const [modules, setModules] = useState<AdminModule[] | null>(null)
  const activeItem = useActiveNavItem()

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.user))
      .catch(() => {}) // Header identity is a nicety; the page's own fetch gates content.
    getMyAccess()
      .then((res) => setModules(res.modules))
      .catch(() => setModules([]))
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
            <SidebarContent activeHref={activeItem?.href} user={user} modules={modules} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:flex">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 border-r border-border bg-navy-50 lg:block">
          <div className="sticky top-0 h-svh">
            <SidebarContent activeHref={activeItem?.href} user={user} modules={modules} />
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
