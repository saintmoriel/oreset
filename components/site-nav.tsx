import Image from 'next/image'

const links = [
  { label: 'The problem', href: '#problem' },
  { label: 'What we build', href: '#build' },
  { label: 'Contact', href: '#contact' },
]

export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8 md:py-5">
        <a href="#top" className="flex items-center gap-2.5" aria-label="Oreset home">
          <Image
            src="/oreset-logo.png"
            alt="Oreset logo"
            width={36}
            height={36}
            className="h-9 w-9"
            priority
          />
          <span className="font-serif text-lg font-semibold tracking-tight text-primary">Oreset</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Get in touch
        </a>
      </div>
    </header>
  )
}
