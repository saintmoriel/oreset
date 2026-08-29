'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { OperatorAppShell } from '@/components/operator/operator-app-shell'
import { getOperatorQueue, type OperatorQueueItem } from '@/lib/api/endpoints/operator'
import { ApiError } from '@/lib/api/client'
import { ReviewerWorkspace } from '@/components/reviewer/workspace'
import { LegacyReviewItem } from '@/components/reviewer/legacy-review-item'
import type { ReviewCase, ReviewSubmission } from '@/lib/types/case'

export default function OperatorItemPage() {
  const router = useRouter()

  const [items, setItems] = useState<OperatorQueueItem[] | null>(null)
  const [reviewCase, setReviewCase] = useState<ReviewCase | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getOperatorQueue()
      .then((res) => {
        setItems(res.items)
        if (res.items[0] && 'input' in res.items[0]) {
          setReviewCase(res.items[0] as unknown as ReviewCase)
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the queue.'))
  }, [])

  async function handleSubmit(submission: ReviewSubmission) {
    // TODO: wire to API endpoint when backend supports new format
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
    // TODO: wire to escalation API endpoint
    console.log('Escalated:', caseId, reason)
    router.push('/operator/home')
  }

  if (error && !items) {
    return (
      <OperatorAppShell>
        <p className="cx-body text-destructive">{error}</p>
      </OperatorAppShell>
    )
  }

  if (!items) {
    return (
      <OperatorAppShell>
        <div className="flex justify-center p-16">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      </OperatorAppShell>
    )
  }

  const item = items[0]
  if (!item) {
    router.push('/operator/home')
    return null
  }

  // New workspace for cases with full ReviewCase structure
  if (reviewCase) {
    return (
      <OperatorAppShell>
        <ReviewerWorkspace
          reviewCase={reviewCase}
          template={null}
          onSubmit={handleSubmit}
          onEscalate={handleEscalate}
        />
      </OperatorAppShell>
    )
  }

  // Legacy fallback for old-format queue items
  return (
    <OperatorAppShell>
      <LegacyReviewItem
        items={items}
        onItemsChange={setItems}
        onQueueEmpty={() => router.push('/operator/home')}
      />
    </OperatorAppShell>
  )
}
