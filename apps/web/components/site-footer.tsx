'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

const columns = [
  {
    title: 'Service',
    links: [
      { label: 'AI Agent Risk Assessment', href: '#what-we-test' },
      { label: 'Data Origination', href: '/services/data-origination' },
      { label: 'African AI Assurance', href: '/services/african-ai-assurance' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Methodology', href: '#methodology' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'FAQ', href: '#faq' },
      { label: 'Blog', href: '/blog' },
      { label: 'Documentation', href: '/docs' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Why now', href: '#why-now' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'Portals',
    links: [
      { label: 'Client', href: '/buyer' },
      { label: 'Reviewer', href: '/operator' },
      { label: 'Admin', href: '/admin' },
    ],
  },
]

export function SiteFooter() {
  const reduceMotion = useReducedMotion()

  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="container-wide">
        <motion.div
          className="border-b border-ink-border py-16 md:py-20"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="max-w-3xl font-display text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl">
            The penetration test for AI&nbsp;decisions.
          </p>
          <p className="mt-4 max-w-xl text-body text-ink-muted">
            We stress-test your AI agent for security failures and wrong decisions —
            before your users find them first.
          </p>
        </motion.div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 md:grid-cols-5 md:py-14">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <Image
                src="/oreset-logo v2.png"
                alt=""
                width={28}
                height={28}
                className="size-7 brightness-200"
              />
              <span className="font-display text-base font-semibold tracking-display">Oreset</span>
            </div>
            <p className="mt-4 max-w-xs text-body-sm text-ink-muted">
              Oreset Africa Hub
              <br />
              Abuja, Nigeria
            </p>
            <a
              href="mailto:info@oreset.africa"
              className="mt-4 inline-block text-body-sm text-ink-muted transition-colors hover:text-copper-300"
            >
              info@oreset.africa
            </a>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-eyebrow text-ink-muted">{col.title}</p>
              <nav className="mt-4 flex flex-col gap-2.5" aria-label={col.title}>
                {col.links.map((link) =>
                  link.href.startsWith('/') ? (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-body-sm text-ink-muted transition-colors hover:text-ink-foreground"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-body-sm text-ink-muted transition-colors hover:text-ink-foreground"
                    >
                      {link.label}
                    </a>
                  )
                )}
              </nav>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-ink-border py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption uppercase tracking-wider text-ink-muted">
            © {new Date().getFullYear()} Oreset Africa Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}