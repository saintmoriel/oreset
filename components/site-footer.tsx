'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

const columns = [
  {
    title: 'Origin',
    links: [
      { label: 'Overview', href: '#engine' },
      { label: 'Origin pipeline', href: '#origin' },
      { label: 'Commission data', href: '#contact' },
    ],
  },
  {
    title: 'Operators',
    links: [
      { label: 'Overview', href: '#engine' },
      { label: '6-stage lifecycle', href: '#operators' },
      { label: 'Hire operators', href: '#contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'How it works', href: '#trust' },
      { label: 'About', href: '#about' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Get involved', href: '#contact' },
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
            Origination for African&nbsp;AI.
          </p>
          <p className="mt-4 max-w-xl text-body text-ink-muted">
            Consented field data and certified native-language operators, under one Shared
            Trust Ledger.
          </p>
        </motion.div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 md:grid-cols-4 md:py-14">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <Image
                src="/oreset-logo.png"
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
              href="mailto:hello@oreset.africa"
              className="mt-4 inline-block text-body-sm text-ink-muted transition-colors hover:text-copper-300"
            >
              hello@oreset.africa
            </a>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-eyebrow text-ink-muted">{col.title}</p>
              <nav className="mt-4 flex flex-col gap-2.5" aria-label={col.title}>
                {col.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-body-sm text-ink-muted transition-colors hover:text-ink-foreground"
                  >
                    {link.label}
                  </a>
                ))}
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