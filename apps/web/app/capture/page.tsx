'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Mic } from 'lucide-react'

export default function CaptureSignInPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    router.push('/capture/home')
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border/70 bg-card/80 backdrop-blur-md">
        <div className="container-narrow flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Oreset home">
            <span className="flex size-8 overflow-hidden rounded-md bg-paper-200">
              <Image src="/oreset-logo.png" alt="" width={32} height={32} className="size-8" />
            </span>
            <span className="font-display text-lg font-semibold tracking-display">Oreset</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to site
          </Link>
        </div>
      </header>

      <main className="container-narrow py-16 sm:py-24">
        <div className="card-surface-raised p-8 sm:p-10">
          <span className="flex size-12 items-center justify-center rounded-xl bg-accent/10">
            <Mic className="size-6 text-accent" />
          </span>
          <p className="text-eyebrow mt-5 text-accent">Origin · Capture</p>
          <h1 className="text-h1 mt-2 text-balance text-foreground">Contributor sign-in</h1>
          <p className="text-body mt-3 text-pretty text-muted-foreground">
            Enter the phone number you registered with. This identifies you for payout only — it
            is never stored alongside your recordings.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-body-sm font-medium text-foreground">Phone number</label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 8XX XXX XXXX"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-body outline-none placeholder:text-muted-foreground/70 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600"
            >
              Continue
              <ArrowRight className="size-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
