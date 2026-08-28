'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ListChecks,
  FileCheck2,
  Wallet,
  ShieldCheck,
  User,
  HelpCircle,
  Menu,
  X,
  Mail,
} from 'lucide-react'
import { SignOutButton } from '@/components/shared/sign-out-button'
import { Avatar } from '@/components/capture/avatar'
import { getMe } from '@/lib/api/endpoints/auth'
import { maskPhone } from '@/lib/capture-format'
import { cn } from '@/lib/utils'
import type { AuthUser } from '@oreset/shared'

const NAV_ITEMS = [
  { label: 'Home', href: '/capture/home', icon: LayoutDashboard },
  { label: 'Batches', href: '/capture/batches', icon: ListChecks },
  { label: 'Submissions', href: '/capture/submissions', icon: FileCheck2 },
  { label: 'Payouts', href: '/capture/payouts', icon: Wallet },
  { label: 'Data & Privacy', href: '/capture/privacy', icon: ShieldCheck },
  { label: 'Account', href: '/capture/account', icon: User },
  { label: 'Help', href: '/capture/help', icon: HelpCircle },
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
      <Link href="/capture/home" className="flex items-center gap-2 px-4 py-4" aria-label="Oreset home">
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
        <Link
          href="/capture/account"
          onClick={onNavigate}
          className="mb-1 flex items-center gap-2.5 rounded-md px-3 py-2 hover:bg-navy-100/60"
        >
          <Avatar displayName={user?.displayName} className="size-8 text-xs" iconClassName="size-4" />
          <span className="min-w-0">
            <span className="cx-body block truncate font-medium text-navy-900">
              {user?.displayName ?? 'Contributor'}
            </span>
            <span className="cx-meta block truncate text-navy-400">
              {user?.phone ? maskPhone(user.phone) : ' '}
            </span>
          </span>
        </Link>
        <a
          href="mailto:hello@oreset.africa"
          className="cx-body flex w-full items-center gap-2.5 rounded-md px-3 py-2 font-medium text-navy-500 hover:bg-navy-100/60 hover:text-navy-800"
        >
          <Mail className="size-4 shrink-0" />
          Support
        </a>
        <SignOutButton
          signInPath="/capture"
          className="cx-body flex w-full items-center gap-2.5 rounded-md px-3 py-2 font-medium text-navy-500 hover:bg-navy-100/60 hover:text-navy-800"
        />
      </div>
    </div>
  )
}

export function CaptureAppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const activeItem = useActiveNavItem()

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.user))
      .catch(() => {}) // Header identity is a nicety, not load-bearing — a stale/expired
    // session here just means no avatar is shown; the page's own server-side
    // fetch (which does gate real content) already handles the real case.
  }, [])

  return (
    <div className="min-h-svh bg-background">
      {/* Mobile top bar */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-navy-50 px-4 lg:hidden">
        <Link href="/capture/home" className="flex items-center gap-2" aria-label="Oreset home">
          <span className="flex size-6 overflow-hidden rounded">
            <Image src="/oreset-logo.png" alt="" width={24} height={24} className="size-6" />
          </span>
          <span className="cx-title text-navy-800">Oreset</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/capture/account" aria-label="Account">
            <Avatar displayName={user?.displayName} className="size-8 text-xs" iconClassName="size-4" />
          </Link>
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
            <Link
              href="/capture/account"
              className="flex items-center gap-2.5 rounded-md py-1.5 pl-1.5 pr-3 hover:bg-navy-50"
            >
              <Avatar displayName={user?.displayName} className="size-7 text-[0.65rem]" iconClassName="size-3.5" />
              <span className="cx-meta font-medium text-navy-500">
                {user?.phone ? maskPhone(user.phone) : ''}
              </span>
            </Link>
          </div>

          <main className="px-4 py-5 sm:px-6 sm:py-6">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
