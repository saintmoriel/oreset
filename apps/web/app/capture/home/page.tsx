'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, TriangleAlert, Wallet, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BATCHES, STATUS_LABEL, TOTAL_PAID, type BatchStatus } from '@/lib/capture-mock-data'

const STATUS_STYLE: Record<BatchStatus, { icon: typeof Clock; text: string; badge: string }> = {
  available: { icon: ArrowRight, text: 'text-accent', badge: 'bg-accent/10 text-accent' },
  under_review: { icon: Clock, text: 'text-muted-foreground', badge: 'bg-muted text-muted-foreground' },
  approved: { icon: CheckCircle2, text: 'text-success', badge: 'bg-success/10 text-success' },
  paid: { icon: Wallet, text: 'text-success', badge: 'bg-success/10 text-success' },
  rejected: { icon: XCircle, text: 'text-destructive', badge: 'bg-destructive/10 text-destructive' },
}

export default function CaptureHomePage() {
  const availableBatches = BATCHES.filter((b) => b.status === 'available')
  const history = BATCHES.filter((b) => b.status !== 'available')

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
            href="/capture"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Sign out
          </Link>
        </div>
      </header>

      <main className="container-narrow py-12 sm:py-16">
        <p className="text-eyebrow text-accent">Welcome back</p>
        <h1 className="text-h1 mt-2 text-balance text-foreground">Your batches</h1>

        <div className="mt-6 flex items-center gap-4 rounded-xl border border-border bg-paper-100 p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success/10">
            <Wallet className="size-5 text-success" />
          </span>
          <div>
            <p className="text-caption text-muted-foreground">Total paid out</p>
            <p className="text-h3 tabular text-foreground">{TOTAL_PAID}</p>
          </div>
        </div>

        {availableBatches.length > 0 && (
          <div className="mt-8 space-y-3">
            <p className="text-eyebrow text-accent">
              {availableBatches.length} batch{availableBatches.length > 1 ? 'es' : ''} available
            </p>
            {availableBatches.map((batch) => (
              <div
                key={batch.id}
                className="card-surface-raised flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="text-h3 text-foreground">{batch.title}</h2>
                  <p className="text-body-sm mt-1 text-muted-foreground">
                    {batch.itemCount} items · {batch.rate} on approval
                  </p>
                </div>
                <Link
                  href={`/capture/batch?id=${batch.id}`}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 sm:w-auto"
                >
                  Start batch
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-h4 mt-10 text-foreground">History</h2>
        <ul className="mt-4 divide-y divide-border/70 border-y border-border/70">
          {history.map((batch) => {
            const { icon: Icon, text, badge } = STATUS_STYLE[batch.status]
            return (
              <li key={batch.id} className="flex items-center justify-between gap-4 py-3.5">
                <div className="flex items-center gap-3">
                  <span className={cn('flex size-8 items-center justify-center rounded-full', badge)}>
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-body-sm font-medium text-foreground">
                      {batch.title} · {batch.itemCount} items
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {batch.submittedAt} · {batch.rate}
                    </p>
                  </div>
                </div>
                <span className={cn('text-caption font-semibold', text)}>{STATUS_LABEL[batch.status]}</span>
              </li>
            )
          })}
        </ul>

        {history.some((b) => b.status === 'rejected') && (
          <p className="mt-4 flex items-start gap-2 text-caption text-muted-foreground">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
            Rejected batches are not paid. Check the batch detail for the Automated Validation reason next time.
          </p>
        )}
      </main>
    </div>
  )
}
