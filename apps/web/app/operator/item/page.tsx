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
import { ApiError, describeError } from '@/lib/api/client'
import { toast } from '@/components/ui/toast'
import { VulnerabilityReviewWorkspace } from '@/components/reviewer/vulnerability-review-workspace'
import { RulesOfEngagementPanel } from '@/components/operator/rules-of-engagement-panel'
import { getEngagementRules } from '@/lib/api/endpoints/engagements'

export default function OperatorItemPage() {
  const router = useRouter()

  const [items, setItems] = useState<OperatorQueueItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  // Engagement whose Rules of Engagement must be acknowledged before the
  // current scenario can be worked. Null when clear.
  const [roeFor, setRoeFor] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await getOperatorQueue()
      if (res.items.length === 0) {
        router.push('/operator/home')
        return
      }
      setItems(res.items)
      // Check the rules up front so the panel appears before any work, not
      // after a rejected submission.
      const first = res.items[0] as OperatorQueueItem & { engagementId?: string | null }
      if (first.engagementId) {
        const rules = await getEngagementRules(first.engagementId).catch(() => null)
        setRoeFor(rules && !rules.acknowledged && rules.rules.trim() ? first.engagementId : null)
      } else {
        setRoeFor(null)
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        // Not onboarded yet: the queue page explains the two remaining steps.
        router.push('/operator/queue')
        return
      }
      setError(describeError(err, 'Could not load the queue.'))
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
      toast.success(
        input.decision === 'exploited' ? 'Finding submitted' : input.decision === 'defended' ? 'Marked defended' : input.decision === 'escalated' ? 'Escalated to lead auditor' : 'Marked inconclusive',
        `${item.externalRef}${input.severity ? ` · ${input.severity}` : ''}${input.vulnTag ? ` · ${input.vulnTag}` : ''}`,
      )
      await load()
    } catch (err) {
      if (err instanceof ApiError && err.code === 'roe_required') {
        const engagementId = (err.details as { engagementId?: string } | undefined)?.engagementId
        if (engagementId) {
          setRoeFor(engagementId)
          toast.error('Rules of Engagement', 'Read and acknowledge them first; your work is kept.')
          return
        }
      }
      const message = describeError(err, 'Could not submit the finding.')
      setError(message)
      toast.error('Not submitted', message)
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

  if (roeFor) {
    return (
      <OperatorAppShell>
        <RulesOfEngagementPanel engagementId={roeFor} onAcknowledged={() => setRoeFor(null)} />
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
