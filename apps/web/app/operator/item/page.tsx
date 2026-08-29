'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { OperatorAppShell } from '@/components/operator/operator-app-shell'
import { getOperatorQueue, type OperatorQueueItem } from '@/lib/api/endpoints/operator'
import { ApiError } from '@/lib/api/client'
import { ReviewerWorkspace } from '@/components/reviewer/workspace'
import { LegacyReviewItem } from '@/components/reviewer/legacy-review-item'
import type { ReviewCase, ReviewSubmission } from '@/lib/types/case'

const DEMO_CASE: ReviewCase = {
  id: 'CASE-2024-00471',
  domain: 'claims',
  scope: 'full',
  language: 'Pidgin English',
  isDualSolve: false,
  isGoldStandard: false,
  createdAt: new Date().toISOString(),
  aiDecision: 'Claim denied — reason: "description inconsistent with reported event type"',
  aiOutcome: 'Motor accident claim (₦340,000) automatically rejected',
  decisionCriteria: 'Motor accident claims are valid when:\n• Event description matches a recognized accident category\n• Date of incident is within 30 days of filing\n• Claimant is the named policyholder or authorized dependent\n• No prior claim for the same event exists',
  input: {
    type: 'text',
    originalText: 'Na for last week Tuesday, I dey go work for morning time wen one okada just rush enter my lane come hit my car for the side. E scratch am well well, the side mirror don comot, and the bumper dey drag for ground. I come park, we exchange number but the okada man no get insurance. I wan claim am make una fix my car abeg.',
    aiInterpretation: 'The claimant reports a vague incident from "last week" involving contact with a motorcycle. Description is inconsistent — mentions both a scratch and significant structural damage (mirror detachment, bumper displacement). Classification: suspicious/inconsistent narrative. Recommendation: deny pending investigation.',
  },
}

const DEMO_TEMPLATE = {
  id: 'tpl-pidgin-claims',
  language: 'Pidgin English',
  domain: 'Claims & Payouts',
  fields: [
    { id: 'event_type', label: 'Event type', type: 'select' as const, options: ['Motor accident', 'Theft', 'Property damage', 'Medical', 'Third-party liability'], value: '' },
    { id: 'when', label: 'When it happened', type: 'text' as const, value: '' },
    { id: 'what_happened', label: 'What happened', type: 'text' as const, value: '' },
    { id: 'damage', label: 'Damage described', type: 'text' as const, value: '' },
    { id: 'request', label: 'What claimant is requesting', type: 'text' as const, value: '' },
  ],
}

function OperatorItemContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  const [items, setItems] = useState<OperatorQueueItem[] | null>(null)
  const [reviewCase, setReviewCase] = useState<ReviewCase | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [demoSubmitted, setDemoSubmitted] = useState(false)

  useEffect(() => {
    if (isDemo) {
      setReviewCase(DEMO_CASE)
      setItems([{ id: DEMO_CASE.id, clientName: 'Demo', externalRef: 'demo', content: '', status: 'pending', createdAt: '' }])
      return
    }
    getOperatorQueue()
      .then((res) => {
        setItems(res.items)
        if (res.items[0] && 'input' in res.items[0]) {
          setReviewCase(res.items[0] as unknown as ReviewCase)
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the queue.'))
  }, [isDemo])

  async function handleSubmit(submission: ReviewSubmission) {
    if (isDemo) {
      console.log('Demo review submitted:', submission)
      setDemoSubmitted(true)
      return
    }
    console.log('Review submitted:', submission)
    const refreshed = await getOperatorQueue()
    if (refreshed.items.length === 0) {
      router.push('/operator/home')
    } else {
      setItems(refreshed.items)
      if ('input' in refreshed.items[0]) {
        setReviewCase(refreshed.items[0] as unknown as ReviewCase)
      } else {
        setReviewCase(null)
      }
    }
  }

  function handleEscalate(caseId: string, reason: string) {
    if (isDemo) {
      console.log('Demo escalated:', caseId, reason)
      setDemoSubmitted(true)
      return
    }
    console.log('Escalated:', caseId, reason)
    router.push('/operator/home')
  }

  if (demoSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="flex size-16 items-center justify-center rounded-full bg-success/10">
          <svg className="size-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-foreground">Review submitted (demo)</h2>
        <p className="text-sm text-muted-foreground max-w-md text-center">
          In production, this would route the evidence trace to the client and update the reviewer's stats.
          Check the browser console to see the full submission payload.
        </p>
        <button
          type="button"
          onClick={() => { setDemoSubmitted(false); setReviewCase(DEMO_CASE) }}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-copper-600"
        >
          Try again
        </button>
      </div>
    )
  }

  if (error && !items) {
    return <p className="cx-body text-destructive">{error}</p>
  }

  if (!items) {
    return (
      <div className="flex justify-center p-16">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    )
  }

  const item = items[0]
  if (!item && !isDemo) {
    router.push('/operator/home')
    return null
  }

  if (reviewCase) {
    return (
      <ReviewerWorkspace
        reviewCase={reviewCase}
        template={isDemo ? DEMO_TEMPLATE : null}
        onSubmit={handleSubmit}
        onEscalate={handleEscalate}
      />
    )
  }

  return (
    <LegacyReviewItem
      items={items}
      onItemsChange={setItems}
      onQueueEmpty={() => router.push('/operator/home')}
    />
  )
}

export default function OperatorItemPage() {
  return (
    <OperatorAppShell>
      <Suspense fallback={<div className="flex justify-center p-16"><Loader2 className="size-8 animate-spin text-accent" /></div>}>
        <OperatorItemContent />
      </Suspense>
    </OperatorAppShell>
  )
}
