'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { OperatorAppShell } from '@/components/operator/operator-app-shell'
import {
  getOperatorQueue,
  submitOperatorDecision,
  type OperatorQueueItem,
} from '@/lib/api/endpoints/operator'
import { ApiError } from '@/lib/api/client'
import { ReviewerWorkspace } from '@/components/reviewer/workspace'
import { LegacyReviewItem } from '@/components/reviewer/legacy-review-item'
import type { ReviewCase, ReviewSubmission } from '@/lib/types/case'

function itemToReviewCase(item: OperatorQueueItem): ReviewCase | null {
  const trace = item.traceData
  if (!trace?.input) return null

  return {
    id: item.id,
    domain: (trace.domain as ReviewCase['domain']) ?? 'claims',
    scope: (trace.scope as ReviewCase['scope']) ?? 'full',
    input: trace.input as ReviewCase['input'],
    aiDecision: trace.aiDecision ?? '',
    aiOutcome: trace.aiOutcome ?? '',
    decisionCriteria: trace.decisionCriteria ?? null,
    language: trace.language ?? 'en',
    createdAt: item.createdAt,
    isDualSolve: trace.isDualSolve ?? false,
    isGoldStandard: trace.isGoldStandard ?? false,
  }
}

export default function OperatorItemPage() {
  const router = useRouter()

  const [items, setItems] = useState<OperatorQueueItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getOperatorQueue()
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the queue.'))
  }, [])

  async function handleWorkspaceSubmit(submission: ReviewSubmission) {
    const item = items?.[0]
    if (!item) return

    const isDefensible = submission.step2.verdict === 'defensible'
    const decision = isDefensible ? 'approved' : 'rejected'

    const errTag = !isDefensible
      ? submission.step1.accuracy === 'critical' || submission.step1.accuracy === 'major'
        ? 'ERR-02' as const
        : submission.step2.verdict === 'not_defensible_language'
          ? 'ERR-02' as const
          : submission.step2.verdict === 'not_defensible_reasoning'
            ? 'ERR-03' as const
            : 'ERR-02' as const
      : undefined

    const severity = !isDefensible
      ? submission.step2.severity >= 4
        ? 'SEV-1' as const
        : submission.step2.severity >= 3
          ? 'SEV-2' as const
          : 'SEV-3' as const
      : undefined

    try {
      await submitOperatorDecision(item.id, {
        decision,
        errTag,
        severity,
        notes: submission.step2.evidenceSummary || undefined,
        correctedTranscript: submission.step1.misreadPhrases.length > 0
          ? submission.step1.misreadPhrases
              .map((p) => `"${p.original}" → "${p.correctMeaning}"`)
              .join('; ')
          : undefined,
        correctedOutcome: !isDefensible ? submission.step2.evidenceSummary : undefined,
        reviewTimeMs: submission.totalTimeMs,
      })

      const refreshed = await getOperatorQueue()
      if (refreshed.items.length === 0) {
        router.push('/operator/home')
      } else {
        setItems(refreshed.items)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit review.')
    }
  }

  async function handleEscalate(caseId: string, reason: string) {
    const item = items?.find((i) => i.id === caseId)
    if (!item) return

    try {
      await submitOperatorDecision(item.id, {
        decision: 'escalated',
        errTag: 'ERR-02',
        severity: 'SEV-2',
        notes: reason,
      })

      const refreshed = await getOperatorQueue()
      if (refreshed.items.length === 0) {
        router.push('/operator/home')
      } else {
        setItems(refreshed.items)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not escalate.')
    }
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

  const reviewCase = itemToReviewCase(item)

  if (reviewCase) {
    return (
      <OperatorAppShell>
        <ReviewerWorkspace
          reviewCase={reviewCase}
          template={null}
          onSubmit={handleWorkspaceSubmit}
          onEscalate={handleEscalate}
        />
      </OperatorAppShell>
    )
  }

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
