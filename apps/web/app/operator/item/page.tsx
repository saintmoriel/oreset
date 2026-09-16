'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { OperatorAppShell } from '@/components/operator/operator-app-shell'
import {
  getOperatorQueue,
  submitOperatorDecision,
  type OperatorQueueItem,
  type DecisionInput,
} from '@/lib/api/endpoints/operator'
import { ApiError } from '@/lib/api/client'
import { VulnerabilityReviewWorkspace } from '@/components/reviewer/vulnerability-review-workspace'

export default function OperatorItemPage() {
  const router = useRouter()

  const [items, setItems] = useState<OperatorQueueItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await getOperatorQueue()
      if (res.items.length === 0) {
        router.push('/operator/home')
        return
      }
      setItems(res.items)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load the queue.')
    }
  }, [router])

  useEffect(() => {
    void load()
  }, [load])

  async function handleSubmit(input: DecisionInput) {
    const item = items?.[0]
    if (!item) return
    setSubmitting(true)
    setError(null)
    try {
      await submitOperatorDecision(item.id, input)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit the finding.')
    } finally {
      setSubmitting(false)
    }
  }

  if (error && !items) {
    return (
      <OperatorAppShell>
        <p className="cx-body text-destructive">{error}</p>
      </OperatorAppShell>
    )
  }

  const item = items?.[0]
  if (!item) {
    return (
      <OperatorAppShell>
        <div className="flex justify-center p-16">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      </OperatorAppShell>
    )
  }

  return (
    <OperatorAppShell>
      {/* Keyed on the item so form state and the timer reset per scenario */}
      <VulnerabilityReviewWorkspace
        key={item.id}
        item={item}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
      />
    </OperatorAppShell>
  )
}
