'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { StepProgress } from '@/components/shared/step-progress'

const QUEUE_STEPS = ['Queue', 'Review', 'Complete'] as const

export function QueueShell({
  badge,
  signOutHref,
  step,
  children,
}: {
  badge: string
  signOutHref: string
  step: number
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border/70 bg-card/80 backdrop-blur-md">
        <div className="container-narrow flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Oreset home">
            <span className="flex size-8 overflow-hidden rounded-md bg-paper-200">
              <Image src="/oreset-logo.png" alt="" width={32} height={32} className="size-8" />
            </span>
            <span className="font-display text-lg font-semibold tracking-display">Oreset</span>
            <span className="ml-1 rounded-full bg-navy-800 px-2 py-0.5 text-caption font-semibold text-white">
              {badge}
            </span>
          </Link>
          <Link
            href={signOutHref}
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Sign out
          </Link>
        </div>
      </header>

      <div className="border-b border-border/70 bg-paper-100/60 py-4">
        <div className="container-narrow">
          <StepProgress steps={QUEUE_STEPS} current={step} />
        </div>
      </div>

      <main className="container-narrow py-12 sm:py-16">{children}</main>
    </div>
  )
}
