import Image from 'next/image'

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-2.5">
          <Image src="/oreset-logo.png" alt="" width={28} height={28} className="h-7 w-7" />
          <span className="font-serif text-base font-semibold tracking-tight">Oreset</span>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink-muted">
          Origination for African AI
        </p>
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink-muted">
          &copy; {new Date().getFullYear()} Oreset
        </p>
      </div>
    </footer>
  )
}
