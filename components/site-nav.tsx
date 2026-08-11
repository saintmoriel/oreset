'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const links = [
  { label: 'Origin', href: '#origin' },
  { label: 'Operators', href: '#operators' },
  { label: 'About', href: '#about' },
]

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed inset-x-0 top-0 z-50 pointer-events-none">
      {/* ── Announcement Banner ── */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-auto overflow-hidden bg-ink/90 backdrop-blur-md text-ink-foreground"
          >
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-6 py-2">
              <span className="size-1.5 rounded-full bg-accent" />
              <a
                href="#contact"
                className="text-xs font-medium tracking-wide transition-colors hover:text-accent sm:text-sm"
              >
                Oreset is now accepting operator applications
                <span className="ml-1.5 inline-block transition-transform hover:translate-x-0.5">→</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Nav ── */}
      <header
        className={cn(
          'pointer-events-auto transition-all duration-300',
          scrolled
            ? 'border-b border-border/50 bg-background/80 backdrop-blur-md shadow-xs'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:h-[4.5rem]">
          <motion.a
            href="#top"
            className="flex items-center gap-2.5"
            aria-label="Oreset home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="flex size-9 items-center justify-center overflow-hidden rounded-lg bg-[#f4efe6]">
              <Image
                src="/oreset-logo.png"
                alt=""
                width={36}
                height={36}
                className="size-9"
                loading='eager'
                priority
              />
            </span>
            <span className="text-lg font-semibold tracking-display">Oreset</span>
          </motion.a>

          <motion.nav
            className="hidden items-center gap-10 md:flex"
            aria-label="Primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </motion.nav>

          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <a
              href="#contact"
              className="hidden rounded-full border border-foreground/20 bg-transparent px-6 py-2 text-sm font-semibold text-foreground transition-all duration-200 hover:border-foreground/40 hover:bg-foreground hover:text-background sm:block"
            >
              Contact Us
            </a>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex size-9 items-center justify-center rounded-lg text-foreground md:hidden"
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                {mobileOpen ? (
                  <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                ) : (
                  <>
                    <path d="M3 5.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M3 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M3 14.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
          </motion.div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border bg-background/95 backdrop-blur-md md:hidden"
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-full border border-foreground/20 px-5 py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Contact Us
              </a>
            </nav>
          </motion.div>
        )}
      </header>
    </div>
  )
}

