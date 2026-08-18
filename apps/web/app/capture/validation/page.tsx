'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Loader2, TriangleAlert } from 'lucide-react'
import { CaptureShell } from '@/components/capture/capture-shell'

function ValidationContent() {
  const router = useRouter()
  const params = useSearchParams()
  const id = params.get('id') ?? ''
  const type = params.get('type') ?? 'audio'
  const isImage = type === 'image'
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const timerId = setTimeout(() => setChecking(false), 1400)
    return () => clearTimeout(timerId)
  }, [])

  return (
    <CaptureShell step={3}>
      <div className="card-surface-raised flex flex-col items-center gap-5 p-8 text-center sm:p-10">
        {checking ? (
          <>
            <Loader2 className="size-10 animate-spin text-accent" />
            <div>
              <h1 className="text-h3 text-foreground">Running Automated Validation…</h1>
              <p className="text-body-sm mt-2 text-muted-foreground">
                {isImage
                  ? 'Checking image quality, framing, and metadata completeness.'
                  : 'Screening for acoustic quality, linguistic match, and completeness.'}
              </p>
            </div>
          </>
        ) : (
          <>
            <p className="text-eyebrow text-accent">Automated Validation result</p>
            <h1 className="text-h2 text-balance text-foreground">Demo: choose an outcome</h1>
            <p className="text-body mx-auto max-w-sm text-pretty text-muted-foreground">
              In production this decision is automatic. For this scaffold, pick a branch to check
              that the flow handles it correctly.
            </p>

            <div className="mt-2 grid w-full gap-3 sm:grid-cols-2">
              <button
                onClick={() => router.push(`/capture/complete?id=${id}&type=${type}`)}
                className="flex flex-col items-center gap-2 rounded-xl border border-success/30 bg-success/5 p-5 text-left hover:bg-success/10"
              >
                <CheckCircle2 className="size-6 text-success" />
                <span className="text-body-sm font-semibold text-foreground">Passed</span>
                <span className="text-caption text-muted-foreground">No errors detected</span>
              </button>
              <button
                onClick={() => router.push(`/capture/task?id=${id}&type=${type}&retake=1`)}
                className="flex flex-col items-center gap-2 rounded-xl border border-warning/30 bg-warning/5 p-5 text-left hover:bg-warning/10"
              >
                <TriangleAlert className="size-6 text-warning" />
                <span className="text-body-sm font-semibold text-foreground">
                  Flagged · {isImage ? 'ERR-04' : 'ERR-01'}
                </span>
                <span className="text-caption text-muted-foreground">
                  {isImage ? 'Missing metadata — retake' : 'Background noise — retake'}
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </CaptureShell>
  )
}

export default function ValidationPage() {
  return (
    <Suspense>
      <ValidationContent />
    </Suspense>
  )
}
