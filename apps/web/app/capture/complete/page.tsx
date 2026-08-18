'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, PartyPopper } from 'lucide-react'
import { CaptureShell } from '@/components/capture/capture-shell'

function CompleteContent() {
  const router = useRouter()
  const params = useSearchParams()
  const id = params.get('id') ?? ''
  const type = params.get('type') ?? 'audio'
  const isImage = type === 'image'

  return (
    <CaptureShell step={4}>
      <div className="card-surface-raised flex flex-col items-start gap-4 p-8 sm:p-10" role="status">
        <span className="flex size-12 items-center justify-center rounded-xl bg-success/10">
          <PartyPopper className="size-6 text-success" />
        </span>
        <h1 className="text-h2 text-foreground">{isImage ? 'Photo' : 'Recording'} submitted.</h1>
        <p className="text-body text-pretty text-muted-foreground">
          Take passed Automated Validation and has been queued for Review Bench. Your submission
          is now stored separately from your identity — only your consent hash links back to you.
          You can track its status and payout from your batches home.
        </p>

        <div className="w-full rounded-lg border border-border bg-paper-100 px-4 py-3 text-body-sm text-muted-foreground">
          Batch progress: <span className="font-semibold text-foreground">1 of 5</span> items submitted
        </div>

        <div className="mt-2 flex w-full flex-col gap-3 sm:flex-row">
          <button
            onClick={() => router.push(`/capture/task?id=${id}&type=${type}`)}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600"
          >
            Capture next item
            <ArrowRight className="size-4" />
          </button>
          <Link
            href="/capture/home"
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md border border-border px-6 text-sm font-semibold text-foreground hover:bg-muted"
          >
            End session
          </Link>
        </div>
      </div>
    </CaptureShell>
  )
}

export default function CompletePage() {
  return (
    <Suspense>
      <CompleteContent />
    </Suspense>
  )
}
