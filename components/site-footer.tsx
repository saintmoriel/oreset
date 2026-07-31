import Image from 'next/image'

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 md:flex-row md:px-8">
        <div className="flex items-center gap-2.5">
          <Image src="/oreset-logo.png" alt="Oreset logo" width={28} height={28} className="h-7 w-7" />
          <span className="font-serif text-base font-semibold tracking-tight text-primary">Oreset</span>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Oreset. Origination for African AI.
        </p>
      </div>
    </footer>
  )
}
