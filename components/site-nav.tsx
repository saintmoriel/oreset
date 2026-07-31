'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const links = [
  { label: '01 / Problem', href: '#problem' },
  { label: '02 / Network', href: '#build' },
  { label: '03 / Contact', href: '#contact' },
]

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          'transition-colors duration-300',
          scrolled ? 'border-b border-ink-border bg-ink/85 backdrop-blur-md' : 'border-b border-transparent',
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#top" className="flex items-center gap-2.5" aria-label="Oreset home">
            <Image src="/oreset-logo.png" alt="" width={34} height={34} className="h-8 w-8" priority />
            <span className="font-serif text-lg font-semibold tracking-tight text-ink-foreground">Oreset</span>
          </a>

          <nav className="hidden items-center gap-9 md:flex" aria-label="Primary">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-mono text-xs uppercase tracking-[0.15em] text-ink-muted transition-colors hover:text-ink-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <a
            href="#contact"
            className="inline-flex items-center rounded-full bg-accent px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-accent-foreground transition-opacity hover:opacity-90"
          >
            Get in touch
          </a>
        </div>
      </div>
    </header>
  )
}
