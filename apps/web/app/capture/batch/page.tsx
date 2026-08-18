'use client'

import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Camera, Mic, ShieldQuestion } from 'lucide-react'
import { BATCHES } from '@/lib/capture-mock-data'

function BatchDetailContent() {
  const params = useSearchParams()
  const batch = BATCHES.find((b) => b.id === params.get('id')) ?? BATCHES.find((b) => b.status === 'available')!
  const TypeIcon = batch.type === 'audio' ? Mic : Camera

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
            href="/capture/home"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to batches
          </Link>
        </div>
      </header>

      <main className="container-narrow py-16 sm:py-24">
        <div className="card-surface-raised flex flex-col items-start gap-6 p-8 sm:p-10">
          <span className="flex size-12 items-center justify-center rounded-xl bg-accent/10">
            <TypeIcon className="size-6 text-accent" />
          </span>
          <div>
            <p className="text-eyebrow text-accent">Origin · Capture</p>
            <h1 className="text-h1 mt-3 text-balance text-foreground">{batch.title}</h1>
            <p className="text-body mt-3 text-pretty text-muted-foreground">{batch.brief}</p>
          </div>

          <div className="w-full border-t border-border/70 pt-5">
            <p className="text-body-sm font-semibold text-foreground">Task brief</p>
            <ul className="mt-3 space-y-2.5 text-body-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <span className="motif-dot mt-1.5 shrink-0" aria-hidden="true" />
                {batch.itemCount} items · ~4 minutes
              </li>
              <li className="flex items-start gap-2.5">
                <span className="motif-dot mt-1.5 shrink-0" aria-hidden="true" />
                {batch.rate} on approval, paid after Review Bench sign-off
              </li>
              <li className="flex items-start gap-2.5">
                <span className="motif-dot mt-1.5 shrink-0" aria-hidden="true" />
                Requires your explicit consent before capture starts
              </li>
              <li className="flex items-start gap-2.5">
                <span className="motif-dot mt-1.5 shrink-0" aria-hidden="true" />
                Automated quality check after every take
              </li>
            </ul>
          </div>

          {batch.guidelines && (
            <div className="w-full border-t border-border/70 pt-5">
              <p className="text-body-sm font-semibold text-foreground">Submission guidelines</p>
              <ul className="mt-3 space-y-2.5 text-body-sm text-muted-foreground">
                {batch.guidelines.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="motif-dot mt-1.5 shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {batch.permissions && (
            <div className="flex w-full items-start gap-2.5 rounded-lg border border-border bg-paper-100 p-4 text-body-sm text-muted-foreground">
              <ShieldQuestion className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>
                <strong className="font-semibold text-foreground">Required permissions:</strong>{' '}
                {batch.permissions.join(', ')}. You&apos;ll be asked to grant these before capture.
              </span>
            </div>
          )}

          <Link
            href={`/capture/consent?id=${batch.id}&type=${batch.type}`}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 sm:w-auto"
          >
            Begin session
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>
    </div>
  )
}

export default function BatchDetailPage() {
  return (
    <Suspense>
      <BatchDetailContent />
    </Suspense>
  )
}
