'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

const footerColumns = [
  {
    title: 'Network',
    links: [
      { label: 'Oreset Origin', href: '#origin' },
      { label: 'Oreset Operators', href: '#operators' },
      { label: 'Trust Ledger', href: '#about' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
      { label: 'Careers', href: '#contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Data Guidelines', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  },
]

const socials = [
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
      </svg>
    ),
  },
  {
    label: 'X',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z" />
      </svg>
    ),
  },
]

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto max-w-7xl px-6">
        {/* ── Large tagline ── */}
        <motion.div
          className="border-b border-ink-border py-20 md:py-28"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="max-w-3xl text-3xl font-semibold leading-snug tracking-tight text-ink-foreground sm:text-4xl md:text-5xl lg:text-6xl"
             style={{ fontStyle: 'italic' }}
          >
            A Data-and-Talent Origination Network for African&nbsp;AI
          </p>
        </motion.div>

        {/* ── Columns ── */}
        <div className="grid grid-cols-2 gap-8 py-14 md:grid-cols-5 md:py-16">
          {/* Brand */}
          <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <Image src="/oreset-logo.png" loading='eager' alt="" width={28} height={28} className="size-7 brightness-200" />
              <span className="text-base font-semibold tracking-display">Oreset</span>
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title} className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-eyebrow text-ink-muted">
                {col.title}
              </p>
              <nav className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm text-ink-muted transition-colors hover:text-ink-foreground"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-ink-border py-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="text-ink-muted transition-colors hover:text-ink-foreground"
              >
                {social.icon}
              </a>
            ))}
          </div>
          <p className="text-xs uppercase tracking-wider text-ink-muted">
            Copyright &copy; {new Date().getFullYear()} Oreset. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
