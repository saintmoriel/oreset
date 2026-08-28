'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnnouncementBar } from './announcement-bar'
import { openPilotModal } from './pilot-scoping-modal'

type NavChild = { label: string; href: string; hint: string; action?: 'pilot' }

type NavItem =
  | { label: string; href: string }
  | {
      label: string
      href: string
      children: NavChild[]
    }

const navItems: NavItem[] = [
  {
    label: 'Solutions',
    href: '#engine',
    children: [
      {
        label: 'Claims & payouts',
        href: '#engine',
        hint: 'Catching language-driven claim errors',
      },
      {
        label: 'Lending & credit decisions',
        href: '#engine',
        hint: 'Verifying loan decisions across languages',
      },
      {
        label: 'Government & public services',
        href: '#engine',
        hint: 'Verified access for every language spoken',
      },
      {
        label: 'Verify a decision',
        href: '#contact',
        hint: 'Send us a real example',
        action: 'pilot',
      },
    ],
  },
  {
    label: 'Platform',
    href: '#engine',
    children: [
      {
        label: 'The verification engine',
        href: '#engine',
        hint: 'Understanding vs. outcome, checked separately',
      },
      {
        label: 'Shared Trust Ledger',
        href: '#trust',
        hint: 'Consent, scorecards, wage floor',
      },
      {
        label: 'Certified reviewer network',
        href: '#operators',
        hint: 'Domain-matched, not just fluent',
      },
      {
        label: 'Evidence & delivery',
        href: '#trust',
        hint: 'Reproducible traces, not vague reports',
      },
    ],
  },
  {
    label: 'Reviewers',
    href: '#operators',
  },
  {
    label: 'Company',
    href: '#about',
    children: [
      {
        label: 'About Oreset',
        href: '#about',
        hint: 'Thesis and approach',
      },
      {
        label: 'FAQ',
        href: '#faq',
        hint: 'Straight answers for buyers',
      },
      {
        label: 'Operator applications',
        href: '/operators/join',
        hint: 'African cohorts',
      },
      {
        label: 'Contact',
        href: '#contact',
        hint: 'Partnership inquiries',
      },
    ],
  },
]

const signInItems = [
  { label: 'Contributor', href: '/capture', hint: 'Field data collection' },
  { label: 'Operator', href: '/operator', hint: 'Certified review work' },
  { label: 'Buyer', href: '/buyer', hint: 'Commission & manage data' },
] as const

const staffItems = [
  { label: 'QA', href: '/qa', hint: 'Quality assurance' },
  { label: 'Admin', href: '/admin', hint: 'Platform administration' },
] as const

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileExpand, setMobileExpand] = useState<string | null>(null)
  const reduceMotion = useReducedMotion()
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    window.dispatchEvent(
      new CustomEvent(mobileOpen ? 'oreset:scroll-stop' : 'oreset:scroll-start'),
    )
    return () => {
      document.body.style.overflow = ''
      window.dispatchEvent(new CustomEvent('oreset:scroll-start'))
    }
  }, [mobileOpen])

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!navRef.current?.contains(e.target as Node)) setOpenMenu(null)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpenMenu(null)
        setMobileOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const onDark = !scrolled && !mobileOpen

  function handleChildClick(child: NavChild, close: () => void) {
    close()
    setMobileOpen(false)
    if (child.action === 'pilot') {
      openPilotModal()
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <AnnouncementBar />
      <div
        className={cn(
          'transition-[background,box-shadow,border-color,backdrop-filter] duration-300',
          scrolled || mobileOpen
            ? 'border-b border-border/70 bg-background/90 shadow-[0_1px_0_rgba(22,33,58,0.04)] backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div
          ref={navRef}
          className="container-wide flex h-16 items-center justify-between md:h-[4.25rem]"
        >
          <a href="#top" className="flex items-center gap-2.5 rounded-md" aria-label="Oreset home">
            <span
              className={cn(
                'flex size-8 items-center justify-center overflow-hidden rounded-md sm:size-9 sm:rounded-lg',
                onDark ? 'bg-white/10 ring-1 ring-white/20' : 'bg-paper-200',
              )}
            >
              <Image
                src="/oreset-logo v2.png"
                alt=""
                width={36}
                height={36}
                className={cn('size-8 sm:size-9', onDark && 'brightness-200')}
                priority
              />
            </span>
            <span
              className={cn(
                'font-display text-lg font-semibold tracking-display transition-colors',
                onDark ? 'text-white' : 'text-foreground',
              )}
            >
              Oreset
            </span>
          </a>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
            {navItems.map((item) =>
              'children' in item ? (
                <DesktopDropdown
                  key={item.label}
                  item={item}
                  open={openMenu === item.label}
                  onOpen={() => setOpenMenu(item.label)}
                  onClose={() => setOpenMenu(null)}
                  onDark={onDark}
                  onChildClick={(child) =>
                    handleChildClick(child, () => setOpenMenu(null))
                  }
                />
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'rounded-md px-3 py-2 text-body-sm font-medium transition-colors',
                    onDark
                      ? 'text-white/70 hover:text-white'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <div className="relative" onMouseEnter={() => setOpenMenu('signin')} onMouseLeave={() => setOpenMenu(null)}>
              <button
                type="button"
                aria-expanded={openMenu === 'signin'}
                aria-haspopup="menu"
                onClick={() => setOpenMenu(openMenu === 'signin' ? null : 'signin')}
                className={cn(
                  'hidden rounded-md px-3 py-2 text-body-sm font-medium transition-colors lg:inline-flex lg:items-center lg:gap-1',
                  onDark
                    ? 'text-white/70 hover:text-white'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Sign in
                <span className="text-[10px] opacity-70" aria-hidden="true">▾</span>
              </button>

              <AnimatePresence>
                {openMenu === 'signin' && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-full z-50 w-64 pt-2"
                  >
                    <div className="card-surface-raised overflow-hidden p-2">
                      <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-eyebrow text-muted-foreground">
                        Sign in as
                      </p>
                      {signInItems.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          role="menuitem"
                          onClick={() => setOpenMenu(null)}
                          className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary"
                        >
                          <span className="block text-body-sm font-semibold text-foreground">{item.label}</span>
                          <span className="text-caption text-muted-foreground">{item.hint}</span>
                        </Link>
                      ))}
                      <div className="mx-3 my-1.5 border-t border-border/60" />
                      <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-eyebrow text-muted-foreground">
                        Staff
                      </p>
                      {staffItems.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          role="menuitem"
                          onClick={() => setOpenMenu(null)}
                          className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary"
                        >
                          <span className="block text-body-sm font-semibold text-foreground">{item.label}</span>
                          <span className="text-caption text-muted-foreground">{item.hint}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => openPilotModal()}
              className={cn(
                'rounded-md px-3.5 py-2 text-body-sm font-semibold transition-[transform,background-color] duration-200 hover:-translate-y-px sm:px-4',
                onDark
                  ? 'bg-accent text-accent-foreground hover:bg-copper-600'
                  : 'bg-primary text-primary-foreground hover:bg-navy-700',
              )}
            >
              Scope a Pilot
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className={cn(
                'inline-flex size-9 items-center justify-center rounded-md lg:hidden',
                onDark ? 'text-white' : 'text-foreground',
              )}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                {mobileOpen ? (
                  <path
                    d="M5 5L15 15M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                ) : (
                  <>
                    <path d="M3 5.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M3 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M3 14.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav"
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[calc(100svh-4rem)] overflow-y-auto border-b border-border bg-background/98 backdrop-blur-xl lg:hidden"
          >
            <nav className="container-wide flex flex-col gap-1 py-4" aria-label="Mobile">
              {navItems.map((item) =>
                'children' in item ? (
                  <div key={item.label} className="border-b border-border/50 py-1">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileExpand((v) => (v === item.label ? null : item.label))
                      }
                      className="flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-body font-medium text-foreground"
                      aria-expanded={mobileExpand === item.label}
                    >
                      <span className="inline-flex items-center gap-1">
                        {item.label}
                        <span className="text-muted-foreground/60" aria-hidden="true">
                          ▾
                        </span>
                      </span>
                      <ChevronDown
                        className={cn(
                          'size-4 text-muted-foreground transition-transform',
                          mobileExpand === item.label && 'rotate-180',
                        )}
                      />
                    </button>
                    {mobileExpand === item.label && (
                      <div className="mb-2 ml-2 flex flex-col gap-0.5 border-l border-border pl-3">
                        {item.children.map((child) =>
                          child.action === 'pilot' ? (
                            <button
                              key={child.label}
                              type="button"
                              onClick={() => handleChildClick(child, () => setOpenMenu(null))}
                              className="rounded-md px-3 py-2.5 text-left"
                            >
                              <span className="block text-body-sm font-medium text-foreground">
                                {child.label}
                              </span>
                              <span className="text-caption text-muted-foreground">
                                {child.hint}
                              </span>
                            </button>
                          ) : child.href.startsWith('/') ? (
                            <Link
                              key={child.label}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className="rounded-md px-3 py-2.5"
                            >
                              <span className="block text-body-sm font-medium text-foreground">
                                {child.label}
                              </span>
                              <span className="text-caption text-muted-foreground">
                                {child.hint}
                              </span>
                            </Link>
                          ) : (
                            <a
                              key={child.label}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className="rounded-md px-3 py-2.5"
                            >
                              <span className="block text-body-sm font-medium text-foreground">
                                {child.label}
                              </span>
                              <span className="text-caption text-muted-foreground">
                                {child.hint}
                              </span>
                            </a>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-3 text-body font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {item.label}
                  </a>
                ),
              )}
              <div className="border-t border-border/50 pt-3 mt-2">
                <p className="px-3 pb-2 text-caption font-semibold uppercase tracking-eyebrow text-muted-foreground">Sign in</p>
                <div className="flex flex-col gap-0.5">
                  {signInItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-3 py-2.5"
                    >
                      <span className="block text-body-sm font-medium text-foreground">{item.label}</span>
                      <span className="text-caption text-muted-foreground">{item.hint}</span>
                    </Link>
                  ))}
                </div>
                <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-eyebrow text-muted-foreground">Staff</p>
                <div className="flex flex-col gap-0.5">
                  {staffItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-3 py-2.5"
                    >
                      <span className="block text-body-sm font-medium text-foreground">{item.label}</span>
                      <span className="text-caption text-muted-foreground">{item.hint}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function DesktopDropdown({
  item,
  open,
  onOpen,
  onClose,
  onDark,
  onChildClick,
}: {
  item: Extract<NavItem, { children: unknown[] }>
  open: boolean
  onOpen: () => void
  onClose: () => void
  onDark: boolean
  onChildClick: (child: NavChild) => void
}) {
  const id = useId()

  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={id}
        onClick={() => (open ? onClose() : onOpen())}
        className={cn(
          'inline-flex items-center gap-1 rounded-md px-3 py-2 text-body-sm font-medium transition-colors',
          onDark ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {item.label}
        <span className="text-[10px] opacity-70" aria-hidden="true">
          ▾
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            role="menu"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-full z-50 w-80 pt-2"
          >
            <div className="card-surface-raised overflow-hidden p-2">
              <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-eyebrow text-muted-foreground">
                {item.label}
              </p>
              {item.children.map((child) =>
                child.action === 'pilot' ? (
                  <button
                    key={child.label}
                    type="button"
                    role="menuitem"
                    onClick={() => onChildClick(child)}
                    className="block w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-secondary"
                  >
                    <span className="block text-body-sm font-semibold text-foreground">
                      {child.label}
                    </span>
                    <span className="text-caption text-muted-foreground">{child.hint}</span>
                  </button>
                ) : child.href.startsWith('/') ? (
                  <Link
                    key={child.label}
                    href={child.href}
                    role="menuitem"
                    onClick={onClose}
                    className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary"
                  >
                    <span className="block text-body-sm font-semibold text-foreground">
                      {child.label}
                    </span>
                    <span className="text-caption text-muted-foreground">{child.hint}</span>
                  </Link>
                ) : (
                  <a
                    key={child.label}
                    href={child.href}
                    role="menuitem"
                    onClick={onClose}
                    className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary"
                  >
                    <span className="block text-body-sm font-semibold text-foreground">
                      {child.label}
                    </span>
                    <span className="text-caption text-muted-foreground">{child.hint}</span>
                  </a>
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}